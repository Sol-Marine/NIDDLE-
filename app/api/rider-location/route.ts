import { NextRequest } from "next/server";
import { upsertRiderLocation, getRiderLocation, getAllRiderLocations } from "@/app/lib/db";

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
  const body = await request.json();
  if (!body.riderId || !body.lat || !body.lng) {
    return Response.json({ error: "riderId, lat, lng required" }, { status: 400 });
  }

  const location = upsertRiderLocation({
    riderId: body.riderId,
    riderName: body.riderName || "Rider",
    lat: body.lat,
    lng: body.lng,
    heading: body.heading,
    speed: body.speed,
    updatedAt: new Date().toISOString(),
  });

  return Response.json(location, { status: 201 });
}
