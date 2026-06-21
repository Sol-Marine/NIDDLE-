import { supabase } from "./db";

const LAGOS_COORDS: Record<string, { lat: number; lng: number }> = {
  "ikeja": { lat: 6.6059, lng: 3.3499 },
  "victoria island": { lat: 6.4281, lng: 3.4219 },
  "lekki": { lat: 6.4493, lng: 3.4748 },
  "surulere": { lat: 6.5321, lng: 3.3530 },
  "yaba": { lat: 6.5158, lng: 3.3895 },
  "ikoyi": { lat: 6.4493, lng: 3.4340 },
  " GRA": { lat: 6.5749, lng: 3.3214 },
  "oshodi": { lat: 6.5520, lng: 3.3550 },
  "mainland": { lat: 6.5158, lng: 3.3895 },
  "island": { lat: 6.4281, lng: 3.4219 },
  "mushin": { lat: 6.5363, lng: 3.3530 },
  "apapa": { lat: 6.4483, lng: 3.3550 },
  "festac": { lat: 6.4700, lng: 3.2840 },
  "ajah": { lat: 6.4699, lng: 3.5627 },
  " Berger": { lat: 6.5900, lng: 3.3900 },
  "ijora": { lat: 6.4530, lng: 3.3850 },
  "ebute metta": { lat: 6.5060, lng: 3.3700 },
  "maryland": { lat: 6.5670, lng: 3.3580 },
  "ogba": { lat: 6.6280, lng: 3.3330 },
  "gbagada": { lat: 6.5440, lng: 3.3940 },
  "lekki phase 1": { lat: 6.4493, lng: 3.4748 },
  "phase 1": { lat: 6.4493, lng: 3.4748 },
  "vi": { lat: 6.4281, lng: 3.4219 },
};

export function findCoords(address: string): { lat: number; lng: number } | null {
  const lower = address.toLowerCase();
  for (const [key, coords] of Object.entries(LAGOS_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateDeliveryFee(
  distanceKm: number,
  surgeMultiplier: number = 1.0,
  timeOfDay?: number
): { baseFee: number; distanceFee: number; surgeFee: number; total: number } {
  const baseFee = 2000;
  const perKmRate = 150;
  const distanceFee = Math.round(distanceKm * perKmRate);

  let timeSurge = 1.0;
  if (timeOfDay !== undefined) {
    if (timeOfDay >= 12 && timeOfDay <= 14) timeSurge = 1.2;
    if (timeOfDay >= 17 && timeOfDay <= 19) timeSurge = 1.3;
    if (timeOfDay >= 21 || timeOfDay <= 5) timeSurge = 1.5;
  }

  const finalMultiplier = Math.max(surgeMultiplier, timeSurge);
  const surgeFee = Math.round((baseFee + distanceFee) * (finalMultiplier - 1));
  const total = Math.round((baseFee + distanceFee) * finalMultiplier);

  return { baseFee, distanceFee, surgeFee, total };
}

export function estimateDeliveryTime(distanceKm: number, prepTimeMinutes: number = 15): number {
  const avgSpeedKmh = 15;
  const trafficFactor = 1.3;
  const travelMinutes = (distanceKm / avgSpeedKmh) * 60 * trafficFactor;
  return Math.round(prepTimeMinutes + travelMinutes + 5); // +5 for pickup buffer
}

export async function getPricingForAddress(
  pickupAddress: string,
  deliveryAddress: string
): Promise<{
  distance: number;
  baseFee: number;
  distanceFee: number;
  surgeMultiplier: number;
  surgeFee: number;
  total: number;
  estimatedMinutes: number;
}> {
  const pickupCoords = findCoords(pickupAddress);
  const deliveryCoords = findCoords(deliveryAddress);

  let distance = 5;
  if (pickupCoords && deliveryCoords) {
    distance = calculateDistance(
      pickupCoords.lat, pickupCoords.lng,
      deliveryCoords.lat, deliveryCoords.lng
    );
  }

  const hour = new Date().getHours();
  let surgeMultiplier = 1.0;
  if (hour >= 12 && hour <= 14) surgeMultiplier = 1.2;
  if (hour >= 17 && hour <= 19) surgeMultiplier = 1.3;
  if (hour >= 21 || hour <= 5) surgeMultiplier = 1.5;

  try {
    const { data: pendingOrders } = await supabase
      .from("store_orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "confirmed", "preparing"]);

    const { data: onlineRiders } = await supabase
      .from("riders")
      .select("id", { count: "exact", head: true })
      .eq("is_online", true);

    const pendingCount = pendingOrders?.length ?? 0;
    const onlineCount = onlineRiders?.length ?? 1;
    const ratio = pendingCount / onlineCount;

    if (ratio > 20) surgeMultiplier = Math.max(surgeMultiplier, 2.5);
    else if (ratio > 10) surgeMultiplier = Math.max(surgeMultiplier, 1.8);
    else if (ratio > 5) surgeMultiplier = Math.max(surgeMultiplier, 1.5);
  } catch {
    // use default
  }

  const pricing = calculateDeliveryFee(distance, surgeMultiplier, hour);
  const estimatedMinutes = estimateDeliveryTime(distance);

  return {
    distance: Math.round(distance * 10) / 10,
    ...pricing,
    surgeMultiplier,
    estimatedMinutes,
  };
}
