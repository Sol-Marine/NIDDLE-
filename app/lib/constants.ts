export const RIDERS = [
  { id: 1, name: "Chidi O.", rating: 4.9, rides: 342, image: "🚴", badge: "Top Rider" },
  { id: 2, name: "Amara K.", rating: 4.8, rides: 287, image: "🚴", badge: "Fast" },
  { id: 3, name: "Femi A.", rating: 4.7, rides: 198, image: "🚴", badge: "Eco" },
  { id: 4, name: "Zainab B.", rating: 4.9, rides: 415, image: "🚴", badge: "Top Rider" },
];

export const PACKAGE_TYPES = [
  "Documents",
  "Food",
  "Parcel",
  "Groceries",
  "Gift",
  "Electronics",
  "Clothing",
  "Other",
];

export const PACKAGE_TYPE_ICONS: Record<string, string> = {
  Documents: "📄",
  Food: "🍔",
  Parcel: "📦",
  Groceries: "🛒",
  Gift: "🎁",
  Electronics: "📱",
  Clothing: "👕",
  Other: "📋",
};

export const SIZES = [
  { label: "Small", icon: "📦", desc: "Up to 2kg — documents, small parcels" },
  { label: "Medium", icon: "📫", desc: "Up to 5kg — food, clothing, gifts" },
  { label: "Large", icon: "🏬", desc: "Up to 15kg — electronics, appliances" },
];

export const TIME_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

export const SPECIAL_HANDLING = [
  { label: "Fragile", fee: 500 },
  { label: "Perishable", fee: 800 },
  { label: "Valuable", fee: 1000 },
  { label: "Urgent", fee: 1500 },
  { label: "None", fee: 0 },
];

export const LAGOS_ZONES = [
  "Ikeja",
  "Victoria Island",
  "Lekki",
  "Surulere",
  "Yaba",
  "Ikoyi",
  "GRA",
  "Oshodi",
];

export const BASE_PRICES: Record<string, number> = {
  Small: 2000,
  Medium: 3500,
  Large: 5000,
};

export const STATUS_STEPS = [
  { label: "Order Placed", icon: "📋", key: "order-placed" },
  { label: "Picked Up", icon: "📦", key: "picked-up" },
  { label: "In Transit", icon: "🚚", key: "in-transit" },
  { label: "Out for Delivery", icon: "🚴", key: "out-for-delivery" },
  { label: "Delivered", icon: "✅", key: "delivered" },
];

export const STATUS_LABELS: Record<string, string> = {
  "order-placed": "Order Placed",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  "delivered": "Delivered",
};

export const STATUS_COLORS: Record<string, string> = {
  "order-placed": "bg-blue-100 text-blue-700",
  "picked-up": "bg-yellow-100 text-yellow-700",
  "in-transit": "bg-orange-100 text-orange-700",
  "out-for-delivery": "bg-purple-100 text-purple-700",
  "delivered": "bg-green-100 text-green-700",
};

export const STATUS_OPTIONS: Record<string, string[]> = {
  "order-placed": ["picked-up", "cancelled"],
  "picked-up": ["in-transit", "cancelled"],
  "in-transit": ["out-for-delivery"],
  "out-for-delivery": ["delivered"],
  delivered: [],
};
