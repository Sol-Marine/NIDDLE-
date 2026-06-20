import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

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

interface DbData {
  deliveries: DeliveryOrder[];
  receiveRequests: ReceiveRequest[];
  riders: Rider[];
  users: User[];
  notifications: Notification[];
  addresses: SavedAddress[];
  payments: Payment[];
  riderLocations: RiderLocation[];
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

function readDb(): DbData {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { deliveries: [], receiveRequests: [], riders: [], users: [], notifications: [], addresses: [], payments: [], riderLocations: [] };
  }
}

function writeDb(data: DbData): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function getDeliveries(): DeliveryOrder[] {
  return readDb().deliveries;
}

export function getDeliveryById(id: string): DeliveryOrder | undefined {
  return readDb().deliveries.find((d) => d.id === id);
}

export function getDeliveriesByPhone(phone: string): DeliveryOrder[] {
  const cleaned = phone.replace(/\D/g, "");
  return readDb().deliveries.filter(
    (d) => d.senderPhone.replace(/\D/g, "").includes(cleaned) || d.recipientPhone.replace(/\D/g, "").includes(cleaned),
  );
}

export function createDelivery(data: DeliveryOrder): DeliveryOrder {
  const db = readDb();
  db.deliveries.unshift(data);
  writeDb(db);
  return data;
}

export function updateDelivery(id: string, updates: Partial<DeliveryOrder>): DeliveryOrder | null {
  const db = readDb();
  const idx = db.deliveries.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  db.deliveries[idx] = { ...db.deliveries[idx], ...updates };
  writeDb(db);
  return db.deliveries[idx];
}

export function getReceiveRequests(): ReceiveRequest[] {
  return readDb().receiveRequests;
}

export function getReceiveRequestById(id: string): ReceiveRequest | undefined {
  return readDb().receiveRequests.find((r) => r.id === id);
}

export function getReceiveRequestsByPhone(phone: string): ReceiveRequest[] {
  const cleaned = phone.replace(/\D/g, "");
  return readDb().receiveRequests.filter((r) => r.phone.replace(/\D/g, "").includes(cleaned));
}

export function createReceiveRequest(data: ReceiveRequest): ReceiveRequest {
  const db = readDb();
  db.receiveRequests.unshift(data);
  writeDb(db);
  return data;
}

export function updateReceiveRequest(id: string, updates: Partial<ReceiveRequest>): ReceiveRequest | null {
  const db = readDb();
  const idx = db.receiveRequests.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  db.receiveRequests[idx] = { ...db.receiveRequests[idx], ...updates };
  writeDb(db);
  return db.receiveRequests[idx];
}

export function getRiders(): Rider[] {
  return readDb().riders;
}

/* ── Rider Locations ── */

export function getRiderLocation(riderId: number): RiderLocation | undefined {
  return readDb().riderLocations.find((l) => l.riderId === riderId);
}

export function getAllRiderLocations(): RiderLocation[] {
  return readDb().riderLocations;
}

export function upsertRiderLocation(data: RiderLocation): RiderLocation {
  const db = readDb();
  const idx = db.riderLocations.findIndex((l) => l.riderId === data.riderId);
  if (idx >= 0) {
    db.riderLocations[idx] = data;
  } else {
    db.riderLocations.push(data);
  }
  writeDb(db);
  return data;
}

/* ── Users ── */

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "staff";
  createdAt: string;
  notifSettings?: { email: boolean; sms: boolean; push: boolean };
}

export function createUser(data: User): User {
  const db = readDb();
  db.users.push(data);
  writeDb(db);
  return data;
}

export function getUserByEmail(email: string): User | undefined {
  const db = readDb();
  return db.users.find((u) => u.email === email);
}

export function getUserById(id: string): User | undefined {
  const db = readDb();
  return db.users.find((u) => u.id === id);
}

/* ── Notifications ── */

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function getNotifications(userId: string): Notification[] {
  const db = readDb();
  return db.notifications.filter((n) => n.userId === userId);
}

export function createNotification(data: Notification): Notification {
  const db = readDb();
  db.notifications.unshift(data);
  writeDb(db);
  return data;
}

export function markNotificationRead(id: string): Notification | null {
  const db = readDb();
  const idx = db.notifications.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  db.notifications[idx].read = true;
  writeDb(db);
  return db.notifications[idx];
}

export function getUnreadCount(userId: string): number {
  const db = readDb();
  return db.notifications.filter((n) => n.userId === userId && !n.read).length;
}

/* ── User Profile ── */

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  writeDb(db);
  return db.users[idx];
}

/* ── Saved Addresses ── */

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export function getAddresses(userId: string): SavedAddress[] {
  const db = readDb();
  return db.addresses.filter((a) => a.userId === userId);
}

export function createAddress(data: SavedAddress): SavedAddress {
  const db = readDb();
  db.addresses.push(data);
  writeDb(db);
  return data;
}

export function updateAddress(id: string, updates: Partial<SavedAddress>): SavedAddress | null {
  const db = readDb();
  const idx = db.addresses.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  db.addresses[idx] = { ...db.addresses[idx], ...updates };
  writeDb(db);
  return db.addresses[idx];
}

export function deleteAddress(id: string): boolean {
  const db = readDb();
  const len = db.addresses.length;
  db.addresses = db.addresses.filter((a) => a.id !== id);
  if (db.addresses.length === len) return false;
  writeDb(db);
  return true;
}

/* ── Payments ── */

export interface Payment {
  id: string;
  userId: string;
  deliveryId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export function getPayments(userId: string): Payment[] {
  const db = readDb();
  return db.payments.filter((p) => p.userId === userId);
}

export function createPayment(data: Payment): Payment {
  const db = readDb();
  db.payments.unshift(data);
  writeDb(db);
  return data;
}
