import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";
import crypto from "crypto";

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(body).digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const { reference, amount, metadata } = event.data;
    const userId = metadata?.userId;
    const type = metadata?.type || "topup";
    const description = metadata?.description || "Wallet top-up";

    if (!userId) return NextResponse.json({ received: true });

    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!wallet) return NextResponse.json({ received: true });

    const { data: existingTx } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("reference", reference)
      .single();

    if (existingTx) return NextResponse.json({ received: true });

    const amountNaira = amount / 100;

    await supabase
      .from("wallets")
      .update({ balance: wallet.balance + amountNaira })
      .eq("id", wallet.id);

    await supabase.from("wallet_transactions").insert({
      id: crypto.randomUUID(),
      wallet_id: wallet.id,
      type: "topup",
      amount: amountNaira,
      reference,
      description,
      status: "completed",
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
