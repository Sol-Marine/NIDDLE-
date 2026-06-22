import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/db";

export const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    commission: 15,
    features: ["List store in marketplace", "Accept orders", "Basic analytics", "Standard support"],
    maxItems: 50,
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 15000,
    commission: 10,
    features: ["Everything in Basic", "Featured store badge", "Advanced analytics", "Priority support", "Promotional banners", "Up to 200 menu items"],
    maxItems: 200,
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 50000,
    commission: 5,
    features: ["Everything in Pro", "Dedicated account manager", "Custom branding", "API access", "Unlimited menu items", "Zero commission on first 100 orders/month"],
    maxItems: -1,
    featured: true,
  },
];

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const storeId = req.nextUrl.searchParams.get("storeId");

  if (storeId) {
    const { data: store } = await supabase
      .from("stores")
      .select("subscription_plan, subscription_expires")
      .eq("id", storeId)
      .single();

    return NextResponse.json({
      plans: SUBSCRIPTION_PLANS,
      current: store?.subscription_plan || "basic",
      expires: store?.subscription_expires || null,
    });
  }

  return NextResponse.json({ plans: SUBSCRIPTION_PLANS });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { storeId, planId } = await req.json();

  if (!storeId || !planId) {
    return NextResponse.json({ error: "Store ID and plan required" }, { status: 400 });
  }

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (!store || store.owner_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const { error } = await supabase
    .from("stores")
    .update({
      subscription_plan: planId,
      subscription_expires: expiresAt.toISOString(),
      commission_rate: plan.commission,
      is_featured: plan.featured,
    })
    .eq("id", storeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    plan: plan.name,
    expires: expiresAt.toISOString(),
    commission: plan.commission,
  });
}
