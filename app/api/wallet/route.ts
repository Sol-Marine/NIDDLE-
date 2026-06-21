import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    const { data: newWallet } = await supabase
      .from("wallets")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        balance: 0,
        currency: "NGN",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    return NextResponse.json({ wallet: newWallet, transactions: [] });
  }

  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ wallet, transactions: transactions ?? [] });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { amount, type, description } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  let { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    const { data: newWallet } = await supabase
      .from("wallets")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        balance: 0,
        currency: "NGN",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    wallet = newWallet;
  }

  if (type === "debit") {
    if (wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }
    await supabase
      .from("wallets")
      .update({ balance: wallet.balance - amount })
      .eq("id", wallet.id);
  } else {
    await supabase
      .from("wallets")
      .update({ balance: wallet.balance + amount })
      .eq("id", wallet.id);
  }

  const tx = await supabase
    .from("wallet_transactions")
    .insert({
      id: crypto.randomUUID(),
      wallet_id: wallet.id,
      type: type || "credit",
      amount,
      reference: crypto.randomUUID().slice(0, 8),
      description: description || (type === "debit" ? "Payment" : "Top-up"),
      status: "completed",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  return NextResponse.json(tx.data);
}
