"use client";
import { useEffect } from "react";
export default function Sw() { useEffect(() => { navigator.serviceWorker?.register("/sw.js").catch(() => {}); }, []); return null; }
