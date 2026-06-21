import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";
import { getPricingForAddress } from "@/app/lib/pricing";

interface CartItem {
  storeId: string;
  storeName: string;
  name: string;
  price: number;
  qty: number;
}

interface CheckoutRequest {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  specialInstructions?: string;
  preferredTime?: string;
  paymentMethod: string;
}

export async function POST(req: NextRequest) {
  const body: CheckoutRequest = await req.json();
  const { items, customerName, customerPhone, customerEmail, deliveryAddress, specialInstructions, preferredTime, paymentMethod } = body;

  if (!items?.length || !customerName || !customerPhone || !deliveryAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const grouped: Record<string, CartItem[]> = {};
  for (const item of items) {
    if (!grouped[item.storeId]) grouped[item.storeId] = [];
    grouped[item.storeId].push(item);
  }

  const storeIds = Object.keys(grouped);
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, address, email")
    .in("id", storeIds);

  const storeMap = new Map((stores ?? []).map((s) => [s.id, s as { id: string; name: string; address: string; email: string; total_orders?: number }]));

  const orders = [];
  let totalPayment = 0;

  for (const [storeId, storeItems] of Object.entries(grouped)) {
    const store = storeMap.get(storeId);
    if (!store) continue;

    const subtotal = storeItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const pricing = await getPricingForAddress(store.address, deliveryAddress);
    const deliveryFee = pricing.total;
    const estimatedDeliveryTime = pricing.estimatedMinutes;

    const orderId = crypto.randomUUID();

    const { error } = await supabase.from("store_orders").insert({
      id: orderId,
      store_id: storeId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      delivery_address: deliveryAddress,
      items: storeItems.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
      total_price: subtotal,
      delivery_fee: deliveryFee,
      dynamic_delivery_fee: deliveryFee,
      surge_multiplier: pricing.surgeMultiplier,
      estimated_delivery_time: estimatedDeliveryTime,
      rider_name: null,
      rider_id: null,
      status: "pending",
      rider_status: "pending",
      payment_method: paymentMethod,
      special_instructions: specialInstructions || "",
      preferred_time: preferredTime || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: `Failed to create order for ${store.name}` }, { status: 500 });
    }

    await supabase
      .from("stores")
      .update({ total_orders: (store.total_orders ?? 0) + 1 })
      .eq("id", storeId);

    orders.push({
      orderId,
      storeName: store.name,
      subtotal,
      deliveryFee,
      surgeMultiplier: pricing.surgeMultiplier,
      estimatedMinutes: pricing.estimatedMinutes,
      distance: pricing.distance,
    });

    totalPayment += subtotal + deliveryFee;

    // Create notification for store owner
    const { data: storeOwner } = await supabase
      .from("users")
      .select("id")
      .eq("email", store.email as string)
      .single();

    if (storeOwner) {
      await supabase.from("notifications").insert({
        id: crypto.randomUUID(),
        user_id: storeOwner.id,
        title: "New Order",
        message: `New order from ${customerName} — ₦${(subtotal + deliveryFee).toLocaleString()}`,
        link: "/store/dashboard",
        read: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    success: true,
    orders,
    totalPayment,
    paymentMethod,
    estimatedDeliveryTime: Math.max(...orders.map((o) => o.estimatedMinutes)),
  });
}
