import "./globals.css";
import { Inter, Barlow_Condensed } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"; import { SpeedInsights } from "@vercel/speed-insights/next";
import Sw from "@/components/Sw"; import Nav from "@/components/Nav"; import Footer from "@/components/Footer";
const f = Inter({ subsets: ["latin"], variable: "--font" });
const d = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--disp" });
export const metadata = { title: "SportsFB", description: "Book sports facilities near you", manifest: "/manifest.webmanifest" };
export const viewport = { themeColor: "#0e1013" };
export default function L({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${f.variable} ${d.variable}`}><Nav />{children}<Footer /><Sw /><Analytics /><SpeedInsights /></body></html>;
}
