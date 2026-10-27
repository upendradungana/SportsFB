import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/db/schema.ts", dialect: "postgresql", dbCredentials: { url: process.env.DATABASE_URL! },
  extensionsFilters: ["postgis"], // never touch PostGIS's own tables (spatial_ref_sys)
  tablesFilter: ["users", "facilities", "bookings", "payment_receipts", "subscriptions", "audit_logs"],
});
