import type { Metadata } from "next";
import "./globals.css";
import { SportsProvider } from "./sports-store";

export const metadata: Metadata = {
  title: "SportsFB — Your sports community",
  description: "Find your people, talk your game, and be part of every moment on SportsFB.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body><SportsProvider>{children}</SportsProvider></body>
    </html>
  );
}
