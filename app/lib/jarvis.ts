import { supabase } from "./db";
import { findCoords, calculateDistance } from "./pricing";

export interface Assignment {
  orderId: string;
  riderId: number;
  riderName: string;
  distance: number;
  score: number;
}

export interface PendingOrder {
  id: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  deliveryAddress: string;
  totalPrice: number;
  deliveryFee: number;
  items: { name: string; price: number; qty: number }[];
  createdAt: string;
}

export interface AvailableRider {
  id: number;
  name: string;
  lat: number;
  lng: number;
  sessionId: string;
  batch: number;
  acceptanceRate: number;
  vehicleType: string;
}

export async function getPendingOrders(): Promise<PendingOrder[]> {
  const { data: orders } = await supabase
    .from("store_orders")
    .select("*")
    .in("status", ["ready", "confirmed"])
    .eq("rider_status", "pending")
    .order("created_at", { ascending: true });

  if (!orders) return [];

  const enriched = await Promise.all(
    orders.map(async (o) => {
      const { data: store } = await supabase
        .from("stores")
        .select("name, address")
        .eq("id", o.store_id)
        .single();
      return {
        id: o.id,
        storeId: o.store_id,
        storeName: store?.name ?? "Store",
        storeAddress: store?.address ?? "",
        deliveryAddress: o.delivery_address,
        totalPrice: o.total_price,
        deliveryFee: o.delivery_fee,
        items: o.items as { name: string; price: number; qty: number }[],
        createdAt: o.created_at,
      };
    })
  );

  return enriched;
}

export async function getAvailableRiders(): Promise<AvailableRider[]> {
  const { data: sessions } = await supabase
    .from("rider_sessions")
    .select("*")
    .eq("status", "active");

  if (!sessions || sessions.length === 0) return [];

  const riderIds = [...new Set(sessions.map((s) => s.rider_id))];

  const { data: riders } = await supabase
    .from("riders")
    .select("*")
    .in("id", riderIds)
    .eq("is_online", true);

  if (!riders) return [];

  const riderScores = await Promise.all(
    riderIds.map(async (id) => {
      const { data } = await supabase
        .from("rider_scores")
        .select("batch, acceptance_rate")
        .eq("rider_id", id)
        .single();
      return { riderId: id, batch: data?.batch ?? 12, acceptanceRate: data?.acceptance_rate ?? 100 };
    })
  );

  return riders
    .filter((r) => r.lat && r.lng)
    .map((r) => {
      const score = riderScores.find((s) => s.riderId === r.id);
      const session = sessions.find((s) => s.rider_id === r.id);
      return {
        id: r.id,
        name: r.name,
        lat: r.lat!,
        lng: r.lng!,
        sessionId: session?.id ?? "",
        batch: score?.batch ?? 12,
        acceptanceRate: score?.acceptanceRate ?? 100,
        vehicleType: r.vehicle_type ?? "bicycle",
      };
    });
}

export function computeAssignments(
  orders: PendingOrder[],
  riders: AvailableRider[]
): Assignment[] {
  const assignments: Assignment[] = [];
  const assignedRiders = new Set<number>();
  const assignedOrders = new Set<string>();

  for (const order of orders) {
    const storeCoords = findCoords(order.storeAddress);
    const deliveryCoords = findCoords(order.deliveryAddress);

    const bestRider = riders
      .filter((r) => !assignedRiders.has(r.id))
      .map((r) => {
        const distToStore = storeCoords
          ? calculateDistance(r.lat, r.lng, storeCoords.lat, storeCoords.lng)
          : 10;
        const distToCustomer = deliveryCoords && storeCoords
          ? calculateDistance(storeCoords.lat, storeCoords.lng, deliveryCoords.lat, deliveryCoords.lng)
          : 5;
        const totalDist = distToStore + distToCustomer;

        const batchWeight = r.batch / 12;
        const acceptanceWeight = r.acceptanceRate / 100;
        const score = totalDist * (1 + batchWeight) * (2 - acceptanceWeight);

        return { rider: r, distance: totalDist, score };
      })
      .sort((a, b) => a.score - b.score)[0];

    if (bestRider) {
      assignments.push({
        orderId: order.id,
        riderId: bestRider.rider.id,
        riderName: bestRider.rider.name,
        distance: Math.round(bestRider.distance * 10) / 10,
        score: Math.round(bestRider.score * 100) / 100,
      });
      assignedRiders.add(bestRider.rider.id);
      assignedOrders.add(order.id);
    }
  }

  return assignments;
}

export async function executeAssignment(assignment: Assignment): Promise<boolean> {
  const { error } = await supabase
    .from("store_orders")
    .update({
      rider_id: assignment.riderId,
      rider_name: assignment.riderName,
      rider_status: "assigned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignment.orderId);

  if (error) return false;

  await supabase
    .from("deliveries")
    .update({
      rider_id: assignment.riderId,
      rider_name: assignment.riderName,
    })
    .eq("id", assignment.orderId);

  return true;
}
