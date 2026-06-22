import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/db";

const POINTS_PER_Naira = 0.1; // 1 point per ₦10 spent
const REDEEM_RATE = 10; // 10 points = ₦1 discount

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("loyalty_points, total_spent")
    .eq("id", user.id)
    .single();

  const points = userData?.loyalty_points || 0;
  const totalSpent = userData?.total_spent || 0;
  const tier = points >= 5000 ? "Gold" : points >= 2000 ? "Silver" : points >= 500 ? "Bronze" : "New";
  const nextTier = points >= 5000 ? null : points >= 2000 ? "Gold" : points >= 500 ? "Silver" : "Bronze";
  const pointsToNext = points >= 5000 ? 0 : points >= 2000 ? 5000 - points : points >= 500 ? 2000 - points : 500 - points;

  return NextResponse.json({
    points,
    totalSpent,
    tier,
    nextTier,
    pointsToNext,
    redeemValue: Math.floor(points / REDEEM_RATE),
    pointsPerNaira: POINTS_PER_Naira,
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { action, amount, orderId } = await req.json();

  if (action === "earn") {
    const pointsToEarn = Math.floor((amount || 0) * POINTS_PER_Naira);
    if (pointsToEarn <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const { data: userData } = await supabase
      .from("users")
      .select("loyalty_points, total_spent")
      .eq("id", user.id)
      .single();

    const currentPoints = userData?.loyalty_points || 0;
    const currentSpent = userData?.total_spent || 0;

    await supabase
      .from("users")
      .update({
        loyalty_points: currentPoints + pointsToEarn,
        total_spent: currentSpent + amount,
      })
      .eq("id", user.id);

    await supabase.from("loyalty_history").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      type: "earn",
      points: pointsToEarn,
      order_id: orderId || null,
      description: `Earned ${pointsToEarn} points for order`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ earned: pointsToEarn, total: currentPoints + pointsToEarn });
  }

  if (action === "redeem") {
    const { data: userData } = await supabase
      .from("users")
      .select("loyalty_points")
      .eq("id", user.id)
      .single();

    const currentPoints = userData?.loyalty_points || 0;
    const redeemAmount = Math.floor(currentPoints / REDEEM_RATE) * REDEEM_RATE;

    if (redeemAmount <= 0) {
      return NextResponse.json({ error: "Not enough points" }, { status: 400 });
    }

    const discount = redeemAmount / REDEEM_RATE;

    await supabase
      .from("users")
      .update({ loyalty_points: currentPoints - redeemAmount })
      .eq("id", user.id);

    await supabase.from("loyalty_history").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      type: "redeem",
      points: -redeemAmount,
      order_id: orderId || null,
      description: `Redeemed ${redeemAmount} points for ₦${discount} discount`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ redeemed: redeemAmount, discount, remaining: currentPoints - redeemAmount });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
