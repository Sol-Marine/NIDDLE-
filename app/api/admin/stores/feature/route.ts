import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { storeId, isFeatured, bannerUrl, promoText } = await req.json();

  if (!storeId) {
    return NextResponse.json({ error: "Store ID required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (isFeatured !== undefined) updates.is_featured = isFeatured;
  if (bannerUrl !== undefined) updates.banner_url = bannerUrl;
  if (promoText !== undefined) updates.promo_text = promoText;

  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ store: data });
}
