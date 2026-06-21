import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";

export async function GET() {
  try {
    // Get demand stats: count pending orders per zone vs available riders
    const { data: pendingOrders } = await supabase
      .from("store_orders")
      .select("id, delivery_address, created_at")
      .in("status", ["pending", "confirmed", "preparing"]);

    const { data: onlineRiders } = await supabase
      .from("riders")
      .select("id, lat, lng")
      .eq("is_online", true);

    const { data: pricingRules } = await supabase
      .from("dynamic_pricing")
      .select("*")
      .eq("is_active", true);

    const pendingCount = pendingOrders?.length ?? 0;
    const onlineCount = onlineRiders?.length ?? 0;
    const ratio = onlineCount > 0 ? pendingCount / onlineCount : pendingCount;

    let demandLevel = "normal";
    let surgeMultiplier = 1.0;
    if (ratio > 20) { demandLevel = "surge"; surgeMultiplier = 2.5; }
    else if (ratio > 10) { demandLevel = "high"; surgeMultiplier = 1.8; }
    else if (ratio > 5) { demandLevel = "high"; surgeMultiplier = 1.5; }

    // Check time-based surge
    const hour = new Date().getHours();
    if (hour >= 12 && hour <= 14) surgeMultiplier = Math.max(surgeMultiplier, 1.2); // lunch
    if (hour >= 17 && hour <= 19) surgeMultiplier = Math.max(surgeMultiplier, 1.3); // dinner
    if (hour >= 21 || hour <= 5) surgeMultiplier = Math.max(surgeMultiplier, 1.5); // late night

    // Find matching pricing rule or use calculated
    const matchingRule = pricingRules?.find(r => r.demand_level === demandLevel);
    const baseFee = matchingRule?.base_fee ?? 2000;

    return NextResponse.json({
      demandLevel,
      surgeMultiplier: Math.round(surgeMultiplier * 100) / 100,
      baseFee,
      pendingOrders: pendingCount,
      onlineRiders: onlineCount,
      ratio: Math.round(ratio * 10) / 10,
    });
  } catch {
    return NextResponse.json({
      demandLevel: "normal",
      surgeMultiplier: 1.0,
      baseFee: 2000,
      pendingOrders: 0,
      onlineRiders: 0,
      ratio: 0,
    });
  }
}
