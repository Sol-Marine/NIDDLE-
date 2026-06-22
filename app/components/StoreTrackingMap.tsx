"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface OrderWithRider {
  orderId: string;
  customerName: string;
  deliveryAddress: string;
  riderName: string;
  riderStatus: string;
  riderLat?: number;
  riderLng?: number;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
}

export default function StoreTrackingMap({ storeId }: { storeId: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [orders, setOrders] = useState<OrderWithRider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrackingData = useCallback(async () => {
    try {
      const res = await fetch(`/api/stores/${storeId}/orders?tracking=true`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 5000);
    return () => clearInterval(interval);
  }, [fetchTrackingData]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView([6.5244, 3.3792], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || orders.length === 0) return;

    orders.forEach((order) => {
      const key = order.orderId;

      if (order.riderLat && order.riderLng) {
        const riderIcon = L.divIcon({
          className: "",
          html: `<div style="background:#D4A24C;color:#1a1a2e;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 12px rgba(212,162,76,0.5);border:3px solid white;">🚴</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const existing = markersRef.current.get(`rider-${key}`);
        if (existing) {
          existing.setLatLng([order.riderLat, order.riderLng]);
        } else {
          const marker = L.marker([order.riderLat, order.riderLng], { icon: riderIcon })
            .addTo(map)
            .bindPopup(
              `<div style="min-width:180px">
                <b>🚴 ${order.riderName}</b><br/>
                <small style="color:#666">${order.riderStatus}</small><br/>
                <small style="color:#666">Order #${order.orderId.slice(0, 8)}</small>
              </div>`
            );
          markersRef.current.set(`rider-${key}`, marker);
        }
      }

      const pickupIcon = L.divIcon({
        className: "",
        html: `<div style="background:#3b82f6;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">📦</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const deliveryIcon = L.divIcon({
        className: "",
        html: `<div style="background:#22c55e;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🏁</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (!markersRef.current.get(`pickup-${key}`)) {
        L.marker([order.pickupLat, order.pickupLng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`📦 Pickup: ${order.deliveryAddress}`);
      }
      if (!markersRef.current.get(`delivery-${key}`)) {
        L.marker([order.deliveryLat, order.deliveryLng], { icon: deliveryIcon })
          .addTo(map)
          .bindPopup(`🏁 Delivery: ${order.deliveryAddress}`);
      }

      if (order.riderLat && order.riderLng) {
        const lineKey = `line-${key}`;
        if (!markersRef.current.get(lineKey)) {
          const line = L.polyline(
            [
              [order.riderLat, order.riderLng],
              [order.deliveryLat, order.deliveryLng],
            ],
            { color: "#D4A24C", weight: 2, opacity: 0.6, dashArray: "6, 6" }
          ).addTo(map);
          markersRef.current.set(lineKey, line as unknown as L.Marker);
        }
      }
    });

    const allCoords: [number, number][] = [];
    orders.forEach((o) => {
      allCoords.push([o.pickupLat, o.pickupLng]);
      allCoords.push([o.deliveryLat, o.deliveryLng]);
      if (o.riderLat && o.riderLng) allCoords.push([o.riderLat, o.riderLng]);
    });
    if (allCoords.length > 0) {
      map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60] });
    }
  }, [orders]);

  return (
    <div className="relative">
      {loading ? (
        <div className="h-96 rounded-2xl bg-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#D4A24C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div ref={mapRef} className="w-full h-96 rounded-2xl overflow-hidden shadow-inner border border-gray-200" />
          <div className="absolute top-2 left-2 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-100">
            <span className="text-sm font-semibold text-gray-700">🗺️ Live Rider Tracking</span>
            <span className="text-xs text-gray-500 ml-2">({orders.length} active)</span>
          </div>
          <div className="absolute bottom-2 left-2 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-gray-100 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> Pickup</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Delivery</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-[#D4A24C]" /> Rider</span>
          </div>
        </>
      )}
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
    </div>
  );
}
