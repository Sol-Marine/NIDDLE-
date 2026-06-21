import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const riderId = searchParams.get("riderId");

  if (!riderId) {
    return NextResponse.json({ error: "riderId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("rider_scores")
    .select("*")
    .eq("rider_id", parseInt(riderId))
    .single();

  if (error) {
    const { data: newScore } = await supabase
      .from("rider_scores")
      .insert({
        id: crypto.randomUUID(),
        rider_id: parseInt(riderId),
        acceptance_rate: 100,
        cancellation_rate: 0,
        avg_delivery_time: 0,
        total_deliveries: 0,
        rating: 5.0,
        batch: 12,
        week_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    return NextResponse.json(newScore);
  }

  return NextResponse.json(data);
}
