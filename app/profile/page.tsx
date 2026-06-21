"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { STATUS_COLORS } from "@/app/lib/constants";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  notifSettings?: { email: boolean; sms: boolean; push: boolean };
}

interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  city: string;
  isDefault: boolean;
}

interface Delivery {
  id: string;
  senderName: string;
  senderPhone?: string;
  recipientName: string;
  recipientPhone?: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  status: string;
  price: number;
  createdAt: string;
  deliveredAt?: string;
}

interface ReceiveRequest {
  id: string;
  fullName: string;
  phone: string;
  packageType: string;
  deliveryAddress: string;
  status: string;
  negotiatedPrice?: number;
  createdAt: string;
}

interface Payment {
  id: string;
  deliveryId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

const tabs = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "addresses", label: "Addresses", icon: "📍" },
  { key: "active", label: "Active", icon: "📦" },
  { key: "history", label: "History", icon: "📋" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [requests, setRequests] = useState<ReceiveRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrLabel, setAddrLabel] = useState("");
  const [addrAddress, setAddrAddress] = useState("");
  const [addrCity, setAddrCity] = useState("");

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      if (!data.id) { router.push("/login"); return; }
      setUser(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      if (data.notifSettings) {
        setNotifEmail(data.notifSettings.email);
        setNotifSms(data.notifSettings.sms);
        setNotifPush(data.notifSettings.push);
      }
    }).catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/addresses").then((r) => r.json()).then(setAddresses);
    fetch("/api/admin?type=deliveries").then((r) => r.json()).then((data: Delivery[]) => {
      setDeliveries(data.filter((d) => d.senderPhone === user.phone || d.recipientPhone === user.phone || d.senderName === user.name || d.recipientName === user.name));
    });
    fetch("/api/admin?type=requests").then((r) => r.json()).then((data: ReceiveRequest[]) => {
      setRequests(data.filter((r) => r.fullName === user.name || r.phone === user.phone));
    });
    fetch("/api/payments").then((r) => r.json()).then(setPayments).finally(() => setLoading(false));
  }, [user]);

  const handleSaveProfile = async () => {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    setUser((prev) => prev ? { ...prev, name, email, phone } : prev);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAddAddress = async () => {
    if (!addrLabel.trim() || !addrAddress.trim()) return;
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: addrLabel, address: addrAddress, city: addrCity, isDefault: addresses.length === 0 }),
    });
    const addr = await res.json();
    setAddresses((prev) => [...prev, addr]);
    setShowAddAddr(false);
    setAddrLabel("");
    setAddrAddress("");
    setAddrCity("");
  };

  const handleDeleteAddress = async (id: string) => {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    for (const a of addresses) {
      await fetch(`/api/addresses/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: a.id === id }),
      });
    }
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleSaveSettings = async () => {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifSettings: { email: notifEmail, sms: notifSms, push: notifPush } }),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#D4A24C] border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!user) return null;

  const activeDeliveries = deliveries.filter((d) => d.status !== "delivered");
  const pastDeliveries = deliveries.filter((d) => d.status === "delivered");

  return (
    <main className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Navbar />
      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#D4A24C] to-[#C2533D] flex items-center justify-center text-2xl md:text-3xl text-white font-bold shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {user.createdAt}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.key ? "bg-[#5A432C] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#D4A24C] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#D4A24C] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#D4A24C] outline-none transition-all" />
              </div>
              <button onClick={handleSaveProfile}
                className="bg-[#5A432C] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#4a3520] transition shadow-md">
                Save Changes
              </button>
              {profileSaved && (
                <p className="text-green-600 text-sm font-semibold">Profile updated!</p>
              )}
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {tab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Saved Addresses</h2>
              <button onClick={() => setShowAddAddr(!showAddAddr)}
                className="bg-[#D4A24C] text-[#1a1a2e] px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition">
                {showAddAddr ? "Cancel" : "+ Add Address"}
              </button>
            </div>

            {showAddAddr && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 max-w-xl">
                <input type="text" value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)}
                  placeholder="Label (e.g. Home, Office)"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                <input type="text" value={addrAddress} onChange={(e) => setAddrAddress(e.target.value)}
                  placeholder="Full address"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="City / Area"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                <button onClick={handleAddAddress}
                  className="bg-[#5A432C] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#4a3520] transition">
                  Save Address
                </button>
              </div>
            )}

            {addresses.length === 0 && !showAddAddr && (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <span className="text-4xl">📍</span>
                <p className="text-gray-500 mt-3">No saved addresses yet</p>
              </div>
            )}

            {addresses.map((addr) => (
              <div key={addr.id} className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${addr.isDefault ? "border-[#D4A24C]" : "border-gray-100"}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-[#D4A24C]/10 text-[#5A432C] px-2 py-0.5 rounded-full font-semibold">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{addr.address}</p>
                  {addr.city && <p className="text-xs text-gray-400 mt-1">{addr.city}</p>}
                </div>
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-[#D4A24C] font-semibold hover:underline">Set Default</button>
                  )}
                  <button onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-red-500 font-semibold hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Tab */}
        {tab === "active" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Active Deliveries</h2>
            {activeDeliveries.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <span className="text-4xl">📦</span>
                <p className="text-gray-500 mt-3">No active deliveries</p>
              </div>
            )}
            {activeDeliveries.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{d.id}</p>
                    <p className="text-sm text-gray-500 truncate">{d.packageType} · {d.pickupAddress} → {d.deliveryAddress}</p>
                    <p className="text-xs text-gray-400 mt-1">{d.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[d.status] || "bg-gray-100"}`}>
                      {d.status.replace(/-/g, " ")}
                    </span>
                    <p className="text-sm font-bold mt-2">₦{d.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Sent Deliveries</h2>
              {pastDeliveries.length === 0 && (
                <p className="text-gray-400 text-sm">No past deliveries</p>
              )}
              {pastDeliveries.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-100 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{d.id}</p>
                      <p className="text-xs text-gray-500 truncate">{d.pickupAddress} → {d.deliveryAddress}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">Delivered</span>
                      <p className="text-xs text-gray-400 mt-1">{d.deliveredAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Received Packages</h2>
              {requests.length === 0 && (
                <p className="text-gray-400 text-sm">No receive requests</p>
              )}
              {requests.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-100 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{r.id}</p>
                      <p className="text-xs text-gray-500">{r.packageType} · {r.deliveryAddress}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        r.status === "quoted" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>{r.status}</span>
                      {r.negotiatedPrice && <p className="text-xs font-bold mt-1">₦{r.negotiatedPrice.toLocaleString()}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {tab === "payments" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Payment History</h2>
            {payments.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <span className="text-4xl">💳</span>
                <p className="text-gray-500 mt-3">No payments yet</p>
              </div>
            )}
            {payments.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{p.deliveryId}</p>
                  <p className="text-xs text-gray-500">{p.method} · {p.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₦{p.amount.toLocaleString()}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    p.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
            <div className="space-y-5">
              {[
                { label: "Email notifications", desc: "Receive delivery updates via email", checked: notifEmail, onChange: setNotifEmail },
                { label: "SMS notifications", desc: "Get text messages for important updates", checked: notifSms, onChange: setNotifSms },
                { label: "Push notifications", desc: "Browser push alerts for real-time tracking", checked: notifPush, onChange: setNotifPush },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                  <button
                    onClick={() => s.onChange(!s.checked)}
                    className={`w-12 h-7 rounded-full transition-all relative ${s.checked ? "bg-[#5A432C]" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${s.checked ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
              <button onClick={handleSaveSettings}
                className="bg-[#5A432C] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#4a3520] transition shadow-md">
                Save Settings
              </button>
              {settingsSaved && (
                <p className="text-green-600 text-sm font-semibold">Settings saved!</p>
              )}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
