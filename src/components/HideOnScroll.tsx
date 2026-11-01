"use client";
import { useEffect, useState } from "react";
export default function HideOnScroll({ children }: { children: React.ReactNode }) {
  const [hide, setHide] = useState(false);
  useEffect(() => { let last = window.scrollY; const f = () => { const y = window.scrollY; setHide(y > last && y > 80); last = y; }; window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  return <header className={"nav set1" + (hide ? " away" : "")}>{children}</header>;
}
