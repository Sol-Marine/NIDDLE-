"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { findCoords } from "../lib/coords";

interface DeliveryMapProps {
  pickupAddress: string;
  deliveryAddress: string;
  riderId?: number;
  riderLat?: number;
  riderLng?: number;
}

export default function DeliveryMap({ pickupAddress, deliveryAddress, riderId, riderLat, riderLng }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Poll for live rider location
  useEffect(() => {
    if (!riderId) return;

    const fetchLocation = async () => {
      try {
        const res = await fetch(`/api/rider-location?riderId=${riderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.lat && data.lng) {
            setLiveLocation({ lat: data.lat, lng: data.lng });
          }
        }
      } catch {
        // silent
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 3000);
    return () => clearInterval(interval);
  }, [riderId]);

  // Initialize map
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
      html: '<div style="background:#3b82f6;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">📦</div>',
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

    const routeLine = L.polyline([pickup, delivery], {
      color: "#D4A24C",
      weight: 3,
      opacity: 0.5,
      dashArray: "10, 10",
    }).addTo(map);

    polylineRef.current = routeLine;

    const bounds = L.latLngBounds([pickup, delivery]);
    map.fitBounds(bounds, { padding: [60, 60] });
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      riderMarkerRef.current = null;
    };
  }, [pickupAddress, deliveryAddress]);

  // Update rider marker when live location changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const pos = liveLocation
      ? [liveLocation.lat, liveLocation.lng] as [number, number]
      : riderLat !== undefined && riderLng !== undefined
        ? [riderLat, riderLng] as [number, number]
        : null;

    if (!pos) return;

    const riderIcon = L.divIcon({
      className: "",
      html: '<div style="background:#D4A24C;color:#1a1a2e;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 12px rgba(212,162,76,0.5);border:3px solid white;animation:pulse 2s infinite;">🚴</div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(pos);
    } else {
      riderMarkerRef.current = L.marker(pos, { icon: riderIcon })
        .addTo(map)
        .bindPopup("🚴 Rider is here");
    }

    map.panTo(pos, { animate: true, duration: 0.5 });

    // Extend bounds to include rider
    const pickup = findCoords(pickupAddress);
    const delivery = findCoords(deliveryAddress);
    const bounds = L.latLngBounds([pickup, delivery, pos]);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [liveLocation, riderLat, riderLng, pickupAddress, deliveryAddress]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-80 rounded-2xl overflow-hidden shadow-inner border border-gray-200" />
      {liveLocation && (
        <div className="absolute top-2 left-2 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-700">Live tracking</span>
        </div>
      )}
    </div>
  );
}
