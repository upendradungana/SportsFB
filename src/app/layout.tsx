import "./globals.css";
import { Plus_Jakarta_Sans, Michroma, Bodoni_Moda } from "next/font/google";
import Sw from "@/components/Sw"; import Nav from "@/components/Nav"; import Footer from "@/components/Footer";
const f = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font" });
const mi = Michroma({ subsets: ["latin"], weight: "400", variable: "--disp" });
const bo = Bodoni_Moda({ subsets: ["latin"], style: ["italic"], variable: "--serif" });
export const metadata = { title: "SportsFB", description: "Book sports facilities", manifest: "/manifest.webmanifest" };
export default function L({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${f.variable} ${mi.variable} ${bo.variable}`}><Nav />{children}<Footer /><Sw /></body></html>;
}
