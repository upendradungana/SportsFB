"use client";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div style={{ height: 220 }}>Loading map…</div> });
export { MapView };
export const d = (x: any) => (x ? new Date(x).toLocaleDateString() : "-");
export const dt = (x: any) => (x ? new Date(x).toLocaleString() : "-");
export const Av = ({ s, n }: { s?: string; n?: string }) => s ? <img src={s} alt="" referrerPolicy="no-referrer" className="av sm" /> : <div className="av sm">{(n || "?")[0]}</div>;
export const Pill = ({ t }: { t: string }) => <span className={"pill " + (/ACTIVE|APPROVED|VERIFIED|CONFIRMED|LISTED/.test(t) ? "ok" : /PENDING|EXPIRING|HIDDEN/.test(t) ? "warn" : "bad")}>{t.replaceAll("_", " ")}</span>;
export const Loc = ({ lat, lng, me }: { lat: number; lng: number; me?: { lat: number; lng: number } | null }) => <>
  <MapView center={{ lat, lng }} marker={{ lat, lng }} me={me} height={220} />
  <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">Open in Google Maps</a></>;
/** Small static map for cards: 4 OpenStreetMap tiles around the pin (neighbouring facilities share tiles, so they cache well). */
export function Thumb({ lat, lng }: { lat: number; lng: number }) {
  const z = 15, n = 2 ** z, tx = ((lng + 180) / 360) * n, r = (lat * Math.PI) / 180, ty = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  const x0 = Math.floor(tx - 0.5), y0 = Math.floor(ty - 0.5);
  return <div className="thumb"><div style={{ position: "absolute", left: "50%", top: "50%" }}>
    {[0, 1].flatMap((i) => [0, 1].map((j) => <img key={`${i}${j}`} alt="" loading="lazy" src={`https://tile.openstreetmap.org/${z}/${x0 + i}/${y0 + j}.png`} style={{ position: "absolute", width: 256, height: 256, maxWidth: "none", left: (x0 + i - tx) * 256, top: (y0 + j - ty) * 256 }} />))}</div>
    <span className="pin" /><small className="attr">© OpenStreetMap</small></div>;
}
export const Drawer = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => <><div className="veil" onClick={onClose} /><div className="drawer"><button className="btn alt" style={{ float: "right" }} onClick={onClose}>Close</button>{children}</div></>;
export const Full = ({ title, onClose, left, right }: { title: string; onClose: () => void; left: React.ReactNode; right: React.ReactNode }) => <div className="full"><header><h2 style={{ margin: 0 }}>{title}</h2><button className="btn alt" onClick={onClose}>Close</button></header><div className="body"><div className="left">{left}</div><div className="right">{right}</div></div></div>;
export const Btn = ({ l, fn, alt, off }: { l: string; fn: () => void; alt?: boolean; off?: boolean }) => <button disabled={off} className={alt ? "btn alt" : "btn"} style={{ padding: "6px 14px", marginRight: 6 }} onClick={(e) => { e.stopPropagation(); fn(); }}>{l}</button>;
export const Filters = ({ items, i, set }: { items: string[]; i: number; set: (n: number) => void }) => <div className="ftabs">{items.map((l, k) => <button key={l} className={"ftab" + (k === i ? " on" : "")} onClick={() => set(k)}>{l}</button>)}</div>;
