import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/* ── Interfaces ── */

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
  timeSlot: string;
  price: number;
  originalPrice?: number;
  negotiationStatus?: string;
  riderId?: number;
  status: string;
  createdAt: string;
  deliveredAt?: string;
  receivedBy?: string;
  proofNote?: string;
}

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

export interface Rider {
  id: number;
  name: string;
  rating: number;
  rides: number;
  badge: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "staff";
  emailVerified?: boolean;
  emailVerifyToken?: string;
  createdAt: string;
  notifSettings?: { email: boolean; sms: boolean; push: boolean };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  deliveryId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export interface RiderLocation {
  riderId: number;
  riderName: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/* ── Row ↔ Model Mappers ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDeliveryRow(row: any): DeliveryOrder {
  return {
    id: row.id as string,
    senderName: row.sender_name as string,
    senderPhone: row.sender_phone as string,
    recipientName: row.recipient_name as string,
    recipientPhone: row.recipient_phone as string,
    pickupAddress: row.pickup_address as string,
    deliveryAddress: row.delivery_address as string,
    packageType: row.package_type as string,
    packageSize: row.package_size as string,
    handling: row.handling as string,
    description: row.description as string,
    weight: row.weight as string,
    value: row.value as string,
    specialInstructions: row.special_instructions as string,
    riderName: row.rider_name as string,
    timeSlot: row.time_slot as string,
    price: row.price as number,
    originalPrice: row.original_price as number | undefined,
    negotiationStatus: row.negotiation_status as string | undefined,
    riderId: row.rider_id as number | undefined,
    status: row.status as string,
    createdAt: row.created_at as string,
    deliveredAt: row.delivered_at as string | undefined,
    receivedBy: row.received_by as string | undefined,
    proofNote: row.proof_note as string | undefined,
  };
}

function toDeliveryRow(data: Partial<DeliveryOrder>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.senderName !== undefined) row.sender_name = data.senderName;
  if (data.senderPhone !== undefined) row.sender_phone = data.senderPhone;
  if (data.recipientName !== undefined) row.recipient_name = data.recipientName;
  if (data.recipientPhone !== undefined) row.recipient_phone = data.recipientPhone;
  if (data.pickupAddress !== undefined) row.pickup_address = data.pickupAddress;
  if (data.deliveryAddress !== undefined) row.delivery_address = data.deliveryAddress;
  if (data.packageType !== undefined) row.package_type = data.packageType;
  if (data.packageSize !== undefined) row.package_size = data.packageSize;
  if (data.handling !== undefined) row.handling = data.handling;
  if (data.description !== undefined) row.description = data.description;
  if (data.weight !== undefined) row.weight = data.weight;
  if (data.value !== undefined) row.value = data.value;
  if (data.specialInstructions !== undefined) row.special_instructions = data.specialInstructions;
  if (data.riderName !== undefined) row.rider_name = data.riderName;
  if (data.timeSlot !== undefined) row.time_slot = data.timeSlot;
  if (data.price !== undefined) row.price = data.price;
  if (data.originalPrice !== undefined) row.original_price = data.originalPrice;
  if (data.negotiationStatus !== undefined) row.negotiation_status = data.negotiationStatus;
  if (data.riderId !== undefined) row.rider_id = data.riderId;
  if (data.status !== undefined) row.status = data.status;
  if (data.createdAt !== undefined) row.created_at = data.createdAt;
  if (data.deliveredAt !== undefined) row.delivered_at = data.deliveredAt;
  if (data.receivedBy !== undefined) row.received_by = data.receivedBy;
  if (data.proofNote !== undefined) row.proof_note = data.proofNote;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromReceiveRequestRow(row: any): ReceiveRequest {
  return {
    id: row.id as string,
    packageType: row.package_type as string,
    description: row.description as string,
    deliveryPref: row.delivery_pref as string,
    instructions: row.instructions as string,
    fullName: row.full_name as string,
    phone: row.phone as string,
    deliveryAddress: row.delivery_address as string,
    preferredTime: row.preferred_time as string,
    notes: row.notes as string,
    createdAt: row.created_at as string,
    negotiatedPrice: row.negotiated_price as number | undefined,
    status: row.status as string,
  };
}

function toReceiveRequestRow(data: Partial<ReceiveRequest>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.packageType !== undefined) row.package_type = data.packageType;
  if (data.description !== undefined) row.description = data.description;
  if (data.deliveryPref !== undefined) row.delivery_pref = data.deliveryPref;
  if (data.instructions !== undefined) row.instructions = data.instructions;
  if (data.fullName !== undefined) row.full_name = data.fullName;
  if (data.phone !== undefined) row.phone = data.phone;
  if (data.deliveryAddress !== undefined) row.delivery_address = data.deliveryAddress;
  if (data.preferredTime !== undefined) row.preferred_time = data.preferredTime;
  if (data.notes !== undefined) row.notes = data.notes;
  if (data.createdAt !== undefined) row.created_at = data.createdAt;
  if (data.negotiatedPrice !== undefined) row.negotiated_price = data.negotiatedPrice;
  if (data.status !== undefined) row.status = data.status;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRiderRow(row: any): Rider {
  return {
    id: row.id as number,
    name: row.name as string,
    rating: row.rating as number,
    rides: row.rides as number,
    badge: row.badge as string,
    active: row.active as boolean,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromUserRow(row: any): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    password: row.password as string,
    phone: row.phone as string | undefined,
    avatar: row.avatar as string | undefined,
    role: row.role as "admin" | "staff",
    emailVerified: row.email_verified as boolean | undefined,
    emailVerifyToken: row.email_verify_token as string | undefined,
    createdAt: row.created_at as string,
    notifSettings: row.notif_settings as { email: boolean; sms: boolean; push: boolean } | undefined,
  };
}

function toUserRow(data: Partial<User>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.name !== undefined) row.name = data.name;
  if (data.email !== undefined) row.email = data.email;
  if (data.password !== undefined) row.password = data.password;
  if (data.phone !== undefined) row.phone = data.phone;
  if (data.avatar !== undefined) row.avatar = data.avatar;
  if (data.role !== undefined) row.role = data.role;
  if (data.emailVerified !== undefined) row.email_verified = data.emailVerified;
  if (data.emailVerifyToken !== undefined) row.email_verify_token = data.emailVerifyToken;
  if (data.createdAt !== undefined) row.created_at = data.createdAt;
  if (data.notifSettings !== undefined) row.notif_settings = data.notifSettings;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromNotificationRow(row: any): Notification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    message: row.message as string,
    link: row.link as string | undefined,
    read: row.read as boolean,
    createdAt: row.created_at as string,
  };
}

function toNotificationRow(data: Partial<Notification>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.userId !== undefined) row.user_id = data.userId;
  if (data.title !== undefined) row.title = data.title;
  if (data.message !== undefined) row.message = data.message;
  if (data.link !== undefined) row.link = data.link;
  if (data.read !== undefined) row.read = data.read;
  if (data.createdAt !== undefined) row.created_at = data.createdAt;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromSavedAddressRow(row: any): SavedAddress {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    label: row.label as string,
    address: row.address as string,
    city: row.city as string,
    isDefault: row.is_default as boolean,
  };
}

function toSavedAddressRow(data: Partial<SavedAddress>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.userId !== undefined) row.user_id = data.userId;
  if (data.label !== undefined) row.label = data.label;
  if (data.address !== undefined) row.address = data.address;
  if (data.city !== undefined) row.city = data.city;
  if (data.isDefault !== undefined) row.is_default = data.isDefault;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromPaymentRow(row: any): Payment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    deliveryId: row.delivery_id as string,
    amount: row.amount as number,
    method: row.method as string,
    status: row.status as string,
    createdAt: row.created_at as string,
  };
}

function toPaymentRow(data: Partial<Payment>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.userId !== undefined) row.user_id = data.userId;
  if (data.deliveryId !== undefined) row.delivery_id = data.deliveryId;
  if (data.amount !== undefined) row.amount = data.amount;
  if (data.method !== undefined) row.method = data.method;
  if (data.status !== undefined) row.status = data.status;
  if (data.createdAt !== undefined) row.created_at = data.createdAt;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRiderLocationRow(row: any): RiderLocation {
  return {
    riderId: row.rider_id as number,
    riderName: row.rider_name as string,
    lat: row.lat as number,
    lng: row.lng as number,
    heading: row.heading as number | undefined,
    speed: row.speed as number | undefined,
    updatedAt: row.updated_at as string,
  };
}

function toRiderLocationRow(data: Partial<RiderLocation>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.riderId !== undefined) row.rider_id = data.riderId;
  if (data.riderName !== undefined) row.rider_name = data.riderName;
  if (data.lat !== undefined) row.lat = data.lat;
  if (data.lng !== undefined) row.lng = data.lng;
  if (data.heading !== undefined) row.heading = data.heading;
  if (data.speed !== undefined) row.speed = data.speed;
  if (data.updatedAt !== undefined) row.updated_at = data.updatedAt;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromContactMessageRow(row: any): ContactMessage {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    subject: row.subject as string,
    message: row.message as string,
    read: row.read as boolean,
    createdAt: row.created_at as string,
  };
}

function toContactMessageRow(data: Partial<ContactMessage>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.name !== undefined) row.name = data.name;
  if (data.email !== undefined) row.email = data.email;
  if (data.subject !== undefined) row.subject = data.subject;
  if (data.message !== undefined) row.message = data.message;
  if (data.read !== undefined) row.read = data.read;
  if (data.createdAt !== undefined) row.created_at = data.createdAt;
  return row;
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/* ── Deliveries ── */

export async function getDeliveries(): Promise<DeliveryOrder[]> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromDeliveryRow);
}

export async function getDeliveryById(id: string): Promise<DeliveryOrder | undefined> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data ? fromDeliveryRow(data) : undefined;
}

export async function getDeliveriesByPhone(phone: string): Promise<DeliveryOrder[]> {
  const cleaned = cleanPhone(phone);
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .or(`sender_phone.ilike.%${cleaned}%,recipient_phone.ilike.%${cleaned}%`);
  if (error) throw error;
  return (data ?? []).map(fromDeliveryRow);
}

export async function createDelivery(data: DeliveryOrder): Promise<DeliveryOrder> {
  const row = toDeliveryRow(data);
  const { data: created, error } = await supabase
    .from("deliveries")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromDeliveryRow(created);
}

export async function updateDelivery(id: string, updates: Partial<DeliveryOrder>): Promise<DeliveryOrder | null> {
  const row = toDeliveryRow(updates);
  if (Object.keys(row).length === 0) {
    return (await getDeliveryById(id)) ?? null;
  }
  const { data: updated, error } = await supabase
    .from("deliveries")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated ? fromDeliveryRow(updated) : null;
}

/* ── Receive Requests ── */

export async function getReceiveRequests(): Promise<ReceiveRequest[]> {
  const { data, error } = await supabase
    .from("receive_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromReceiveRequestRow);
}

export async function getReceiveRequestById(id: string): Promise<ReceiveRequest | undefined> {
  const { data, error } = await supabase
    .from("receive_requests")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data ? fromReceiveRequestRow(data) : undefined;
}

export async function getReceiveRequestsByPhone(phone: string): Promise<ReceiveRequest[]> {
  const cleaned = cleanPhone(phone);
  const { data, error } = await supabase
    .from("receive_requests")
    .select("*")
    .ilike("phone", `%${cleaned}%`);
  if (error) throw error;
  return (data ?? []).map(fromReceiveRequestRow);
}

export async function createReceiveRequest(data: ReceiveRequest): Promise<ReceiveRequest> {
  const row = toReceiveRequestRow(data);
  const { data: created, error } = await supabase
    .from("receive_requests")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromReceiveRequestRow(created);
}

export async function updateReceiveRequest(id: string, updates: Partial<ReceiveRequest>): Promise<ReceiveRequest | null> {
  const row = toReceiveRequestRow(updates);
  if (Object.keys(row).length === 0) {
    return (await getReceiveRequestById(id)) ?? null;
  }
  const { data: updated, error } = await supabase
    .from("receive_requests")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated ? fromReceiveRequestRow(updated) : null;
}

/* ── Riders ── */

export async function getRiders(): Promise<Rider[]> {
  const { data, error } = await supabase
    .from("riders")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRiderRow);
}

/* ── Rider Locations ── */

export async function getRiderLocation(riderId: number): Promise<RiderLocation | undefined> {
  const { data, error } = await supabase
    .from("rider_locations")
    .select("*")
    .eq("rider_id", riderId)
    .single();
  if (error) return undefined;
  return data ? fromRiderLocationRow(data) : undefined;
}

export async function getAllRiderLocations(): Promise<RiderLocation[]> {
  const { data, error } = await supabase
    .from("rider_locations")
    .select("*");
  if (error) throw error;
  return (data ?? []).map(fromRiderLocationRow);
}

export async function upsertRiderLocation(data: RiderLocation): Promise<RiderLocation> {
  const row = toRiderLocationRow(data);
  const { data: upserted, error } = await supabase
    .from("rider_locations")
    .upsert(row, { onConflict: "rider_id" })
    .select()
    .single();
  if (error) throw error;
  return fromRiderLocationRow(upserted);
}

/* ── Users ── */

export async function createUser(data: User): Promise<User> {
  const row = toUserRow(data);
  const { data: created, error } = await supabase
    .from("users")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromUserRow(created);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error) return undefined;
  return data ? fromUserRow(data) : undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data ? fromUserRow(data) : undefined;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const row = toUserRow(updates);
  if (Object.keys(row).length === 0) {
    return (await getUserById(id)) ?? null;
  }
  const { data: updated, error } = await supabase
    .from("users")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated ? fromUserRow(updated) : null;
}

/* ── Notifications ── */

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromNotificationRow);
}

export async function createNotification(data: Notification): Promise<Notification> {
  const row = toNotificationRow(data);
  const { data: created, error } = await supabase
    .from("notifications")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromNotificationRow(created);
}

export async function markNotificationRead(id: string): Promise<Notification | null> {
  const { data: updated, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated ? fromNotificationRow(updated) : null;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}

/* ── Saved Addresses ── */

export async function getAddresses(userId: string): Promise<SavedAddress[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map(fromSavedAddressRow);
}

export async function createAddress(data: SavedAddress): Promise<SavedAddress> {
  const row = toSavedAddressRow(data);
  const { data: created, error } = await supabase
    .from("addresses")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromSavedAddressRow(created);
}

export async function updateAddress(id: string, updates: Partial<SavedAddress>): Promise<SavedAddress | null> {
  const row = toSavedAddressRow(updates);
  if (Object.keys(row).length === 0) {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", id)
      .single();
    return data ? fromSavedAddressRow(data) : null;
  }
  const { data: updated, error } = await supabase
    .from("addresses")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated ? fromSavedAddressRow(updated) : null;
}

export async function deleteAddress(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}

/* ── Payments ── */

export async function getPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromPaymentRow);
}

export async function createPayment(data: Payment): Promise<Payment> {
  const row = toPaymentRow(data);
  const { data: created, error } = await supabase
    .from("payments")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromPaymentRow(created);
}

/* ── Contact Messages ── */

export async function createContactMessage(data: ContactMessage): Promise<ContactMessage> {
  const row = toContactMessageRow(data);
  const { data: created, error } = await supabase
    .from("contact_messages")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromContactMessageRow(created);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromContactMessageRow);
}
