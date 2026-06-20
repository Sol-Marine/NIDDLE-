"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type LType from "leaflet";

const riders = [
  { id: 1, name: "Chidi O.", badge: "Top Rider" },
  { id: 2, name: "Amara K.", badge: "Fast" },
  { id: 3, name: "Femi A.", badge: "Eco" },
  { id: 4, name: "Zainab B.", badge: "Top Rider" },
];

export default function RiderLivePage() {
  const [selectedRider, setSelectedRider] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [updateCount, setUpdateCount] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushLocation = useCallback(async (lat: number, lng: number) => {
    if (!selectedRider) return;
    const rider = riders.find((r) => r.id === selectedRider);
    try {
      await fetch("/api/rider-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId: selectedRider,
          riderName: rider?.name || "Rider",
          lat,
          lng,
        }),
      });
      setUpdateCount((c) => c + 1);
    } catch {
      // silent fail, will retry next interval
    }
  }, [selectedRider]);

  const startSharing = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");

    setError("");
    setIsLive(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        pushLocation(lat, lng);

        if (mapInstance.current) {
          const riderIcon = L.divIcon({
            className: "",
            html: '<div style="background:#D4A24C;color:#1a1a2e;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 12px rgba(212,162,76,0.5);border:3px solid white;animation:pulse 2s infinite;">🚴</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { icon: riderIcon })
              .addTo(mapInstance.current)
              .bindPopup("🚴 You are here");
          }
          mapInstance.current.setView([lat, lng], 15);
        }
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setIsLive(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    intervalRef.current = setInterval(() => {
      setLocation((prev) => {
        if (prev) pushLocation(prev.lat, prev.lng);
        return prev;
      });
    }, 3000);
  }, [selectedRider, pushLocation]);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopSharing();
    };
  }, [stopSharing]);

  // Initialize map when rider selected
  useEffect(() => {
    if (!selectedRider || !mapRef.current || mapInstance.current) return;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      const map = L.map(mapRef.current!, { zoomControl: false }).setView([6.45, 3.40], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      mapInstance.current = map;
    })();
  }, [selectedRider]);

  if (!selectedRider) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#D4A24C]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚴</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Rider Live GPS</h1>
            <p className="text-gray-500 text-sm mt-2">Select your rider profile to start sharing your location.</p>
          </div>

          <div className="space-y-3">
            {riders.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRider(r.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#D4A24C] hover:bg-[#FFF8F0] transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-[#1a1a2e] flex items-center justify-center text-white font-bold text-sm">
                  {r.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.badge}</p>
                </div>
                <span className="text-gray-300">→</span>
              </button>
            ))}
          </div>

          <Link href="/admin" className="block mt-6 text-center text-sm text-[#D4A24C] font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const rider = riders.find((r) => r.id === selectedRider);

  return (
    <main className="min-h-screen bg-[#faf7f2] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { stopSharing(); setSelectedRider(null); }} className="text-gray-400 hover:text-white transition">
            ←
          </button>
          <div>
            <h1 className="font-bold text-sm">{rider?.name}</h1>
            <p className={`text-xs ${isLive ? "text-green-400" : "text-gray-400"}`}>
              {isLive ? "● Sharing live" : "○ Offline"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Updates sent</p>
          <p className="font-bold text-[#D4A24C]">{updateCount}</p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full min-h-[300px]" />

        {/* Location info bar */}
        {location && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 z-[1000]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Current Position</p>
                <p className="text-sm font-mono font-semibold text-gray-800">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${isLive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {isLive ? "LIVE" : "OFFLINE"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-3">{error}</div>
        )}
        <button
          onClick={isLive ? stopSharing : startSharing}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
            isLive
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white hover:shadow-xl"
          }`}
        >
          {isLive ? "⏹ Stop Sharing" : "📍 Start Sharing Location"}
        </button>
      </div>
    </main>
  );
}
