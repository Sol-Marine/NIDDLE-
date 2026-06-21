import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { riderId } = await req.json();

  const { data: order, error: fetchError } = await supabase
    .from("store_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("store_orders")
    .update({
      rider_status: "pending",
      rider_id: null,
      rider_name: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update rider score (cancellation)
  const { data: score } = await supabase
    .from("rider_scores")
    .select("*")
    .eq("rider_id", riderId)
    .single();

  if (score) {
    const newCancellations = score.cancellation_rate + 1;
    const newAcceptance = Math.max(0, score.acceptance_rate - 2);
    await supabase
      .from("rider_scores")
      .update({
        cancellation_rate: newCancellations,
        acceptance_rate: newAcceptance,
        updated_at: new Date().toISOString(),
      })
      .eq("rider_id", riderId);
  }

  return NextResponse.json({ success: true });
}
