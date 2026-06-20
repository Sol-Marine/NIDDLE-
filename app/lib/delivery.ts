const API = "";

export interface DeliveryOrder {
  id: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  packageSize: string;
  handling: string;
  description: string;
  weight: string;
  value: string;
  specialInstructions: string;
  riderName: string;
  riderId?: number;
  timeSlot: string;
  price: number;
  originalPrice?: number;
  negotiationStatus?: string;
  status: string;
  createdAt: string;
  deliveredAt?: string;
  receivedBy?: string;
  proofNote?: string;
}

export function generateTrackingId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `NID-${seg()}-${seg()}`;
}

export async function saveDelivery(order: DeliveryOrder): Promise<DeliveryOrder> {
  const res = await fetch(`${API}/api/deliveries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`Failed to save delivery: ${res.status}`);
  return res.json();
}

export async function getDeliveries(): Promise<DeliveryOrder[]> {
  const res = await fetch(`${API}/api/deliveries`);
  return res.json();
}

export async function getDeliveryById(id: string): Promise<DeliveryOrder | null> {
  const res = await fetch(`${API}/api/deliveries/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getDeliveriesByPhone(phone: string): Promise<DeliveryOrder[]> {
  const res = await fetch(`${API}/api/deliveries?phone=${encodeURIComponent(phone)}`);
  return res.json();
}

export async function updateDelivery(id: string, updates: Partial<DeliveryOrder>): Promise<DeliveryOrder | null> {
  const res = await fetch(`${API}/api/deliveries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

/* ── Receive Requests ── */

export interface ReceiveRequest {
  id: string;
  packageType: string;
  description: string;
  deliveryPref: string;
  instructions: string;
  fullName: string;
  phone: string;
  deliveryAddress: string;
  preferredTime: string;
  notes: string;
  createdAt: string;
  negotiatedPrice?: number;
  status: string;
}

export function generateRequestId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `REQ-${seg()}-${seg()}`;
}

export async function saveReceiveRequest(req: ReceiveRequest): Promise<ReceiveRequest> {
  const res = await fetch(`${API}/api/receive-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Failed to save request: ${res.status}`);
  return res.json();
}

export async function getReceiveRequests(): Promise<ReceiveRequest[]> {
  const res = await fetch(`${API}/api/receive-requests`);
  return res.json();
}

export async function getReceiveRequestById(id: string): Promise<ReceiveRequest | null> {
  const res = await fetch(`${API}/api/receive-requests/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getReceiveRequestsByPhone(phone: string): Promise<ReceiveRequest[]> {
  const res = await fetch(`${API}/api/receive-requests?phone=${encodeURIComponent(phone)}`);
  return res.json();
}

export async function updateReceiveRequest(id: string, updates: Partial<ReceiveRequest>): Promise<ReceiveRequest | null> {
  const res = await fetch(`${API}/api/receive-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getRiders() {
  const res = await fetch(`${API}/api/riders`);
  return res.json();
}
