import { NextRequest } from "next/server";
import { upsertRiderLocation, getRiderLocation, getAllRiderLocations } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const riderId = searchParams.get("riderId");

  if (riderId) {
    const loc = getRiderLocation(parseInt(riderId));
    return Response.json(loc || null);
  }

  return Response.json(getAllRiderLocations());
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.riderId || !body.lat || !body.lng) {
    return Response.json({ error: "riderId, lat, lng required" }, { status: 400 });
  }

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return Response.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const location = upsertRiderLocation({
    riderId: body.riderId,
    riderName: body.riderName || "Rider",
    lat,
    lng,
    heading: body.heading,
    speed: body.speed,
    updatedAt: new Date().toISOString(),
  });

  return Response.json(location, { status: 201 });
}
