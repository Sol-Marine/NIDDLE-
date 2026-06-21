import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const riderId = searchParams.get("riderId");
  const status = searchParams.get("status") || "assigned";

  let query = supabase
    .from("store_orders")
    .select("*")
    .eq("rider_status", status);

  if (riderId) {
    query = query.eq("rider_id", parseInt(riderId));
  }

  const { data: orders, error } = await query.order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = await Promise.all(
    (orders ?? []).map(async (o) => {
      const { data: store } = await supabase
        .from("stores")
        .select("name, address, phone")
        .eq("id", o.store_id)
        .single();
      return { ...o, store };
    })
  );

  return NextResponse.json(enriched);
}
