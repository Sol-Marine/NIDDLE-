"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LAGOS_COORDS } from "@/app/lib/coords";

export default function LagosCoverageMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: true,
    }).setView([6.5244, 3.3792], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const zoneIcon = L.divIcon({
      className: "",
      html: '<div style="background:#D4A24C;color:#1a1a2e;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(212,162,76,0.5);border:2px solid white;cursor:pointer;">📍</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const allCoords: [number, number][] = [];

    Object.entries(LAGOS_COORDS).forEach(([zone, coords]) => {
      L.marker(coords, { icon: zoneIcon })
        .addTo(map)
        .bindPopup(`<strong>${zone}</strong><br/>Same-day bicycle delivery`);
      allCoords.push(coords);
    });

    if (allCoords.length > 0) {
      map.fitBounds(allCoords, { padding: [40, 40] });
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-3xl overflow-hidden"
    />
  );
}
