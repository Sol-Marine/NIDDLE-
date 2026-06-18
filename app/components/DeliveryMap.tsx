"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { findCoords } from "../lib/coords";

interface DeliveryMapProps {
  pickupAddress: string;
  deliveryAddress: string;
  riderLat?: number;
  riderLng?: number;
}

export default function DeliveryMap({ pickupAddress, deliveryAddress, riderLat, riderLng }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const pickup = findCoords(pickupAddress);
    const delivery = findCoords(deliveryAddress);

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(pickup, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const blueIcon = L.divIcon({
      className: "",
      html: '<div style="background:#3b82f6;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">📍</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const greenIcon = L.divIcon({
      className: "",
      html: '<div style="background:#22c55e;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🏁</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(pickup, { icon: blueIcon }).addTo(map).bindPopup("📦 Pickup: " + pickupAddress);
    L.marker(delivery, { icon: greenIcon }).addTo(map).bindPopup("🏁 Delivery: " + deliveryAddress);

    const bounds = L.latLngBounds([pickup, delivery]);
    if (riderLat !== undefined && riderLng !== undefined) {
      bounds.extend([riderLat, riderLng]);
      const riderIcon = L.divIcon({
        className: "",
        html: '<div style="background:#D4A24C;color:#1a1a2e;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 12px rgba(212,162,76,0.5);border:2px solid white;animation:pulse 2s infinite;">🚴</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map).bindPopup("🚴 Rider is here");
    }

    map.fitBounds(bounds, { padding: [60, 60] });
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [pickupAddress, deliveryAddress, riderLat, riderLng]);

  return <div ref={mapRef} className="w-full h-80 rounded-2xl overflow-hidden shadow-inner border border-gray-200" />;
}
