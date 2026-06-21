import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const riderId = searchParams.get("riderId");

  let query = supabase
    .from("rider_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (riderId) {
    query = query.eq("rider_id", parseInt(riderId));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { riderId, startTime, endTime, city } = await req.json();

  if (!riderId || !startTime) {
    return NextResponse.json({ error: "riderId and startTime required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("rider_sessions")
    .select("*")
    .eq("rider_id", riderId)
    .in("status", ["booked", "active"]);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "You already have an active or booked session" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("rider_sessions")
    .insert({
      id: crypto.randomUUID(),
      rider_id: riderId,
      start_time: startTime,
      end_time: endTime || null,
      status: "booked",
      city: city || "Lagos",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { sessionId, status, riderId, lat, lng } = await req.json();

  if (status === "active" && sessionId) {
    const { error } = await supabase
      .from("rider_sessions")
      .update({ status: "active" })
      .eq("id", sessionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (riderId && lat && lng) {
      await supabase
        .from("riders")
        .update({
          is_online: true,
          current_session_id: sessionId,
          lat,
          lng,
        })
        .eq("id", riderId);
    }

    return NextResponse.json({ success: true });
  }

  if (status === "completed" && sessionId) {
    const { error } = await supabase
      .from("rider_sessions")
      .update({ status: "completed", end_time: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (riderId) {
      await supabase
        .from("riders")
        .update({
          is_online: false,
          current_session_id: null,
        })
        .eq("id", riderId);
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
