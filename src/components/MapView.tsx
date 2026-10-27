"use client";
import { useEffect, useRef } from "react"; import "leaflet/dist/leaflet.css";
type P = { lat: number; lng: number };
export default function MapView({ center, zoom = 15, marker, me, onPick, height = 240 }: { center: P; zoom?: number; marker?: P | null; me?: P | null; onPick?: (p: P) => void; height?: number | string }) {
  const el = useRef<HTMLDivElement>(null), ref = useRef<any>(null);
  const put = (p: P) => { const r = ref.current; if (!r) return; r.mk?.remove(); r.mk = r.L.circleMarker([p.lat, p.lng], { radius: 10, color: "#fff", weight: 2, fillColor: "#FF2D95", fillOpacity: 1 }).addTo(r.m); };
  useEffect(() => {
    let dead = false;
    import("leaflet").then((L) => {
      if (dead || !el.current) return;
      const m = L.map(el.current).setView([center.lat, center.lng], zoom); ref.current = { L, m, mk: null };
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
      if (marker) put(marker);
      if (me) L.circleMarker([me.lat, me.lng], { radius: 7, color: "#fff", weight: 2, fillColor: "#007BA7", fillOpacity: 1 }).addTo(m);
      if (onPick) m.on("click", (e: any) => { const p = { lat: e.latlng.lat, lng: e.latlng.lng }; put(p); onPick(p); });
      setTimeout(() => m.invalidateSize(), 250);
    });
    return () => { dead = true; ref.current?.m.remove(); ref.current = null; };
  }, []);
  useEffect(() => { if (marker && ref.current) { put(marker); ref.current.m.setView([marker.lat, marker.lng], Math.max(ref.current.m.getZoom(), 15)); } }, [marker?.lat, marker?.lng]);
  return <div ref={el} style={{ height, borderRadius: 10, margin: "8px 0", background: "#223" }} />;
}
