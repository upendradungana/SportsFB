import { sql } from "drizzle-orm";
import { pgTable, date, uuid, varchar, text, timestamp, boolean, integer, customType, index, jsonb } from "drizzle-orm/pg-core";

const geographyPoint = customType<{ data: { lat: number; lng: number }; driverData: string }>({
  dataType: () => "geography", // no "(Point, 4326)": drizzle-kit quotes custom type names. Point-ness is a CHECK in sql/002
  toDriver: (v) => `SRID=4326;POINT(${v.lng} ${v.lat})`,
});
const ts = (n: string) => timestamp(n, { withTimezone: true });

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleSub: varchar("google_sub", { length: 64 }).unique(), // stable Google id; email can change
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  phone: varchar("phone", { length: 12 }), // E.164, +975 + 8 digits
  role: varchar("role", { length: 20 }).notNull().default("PLAYER"),
  isVerifiedOwner: boolean("is_verified_owner").notNull().default(false),
  isSuspended: boolean("is_suspended").notNull().default(false),
  onboarded: boolean("onboarded").notNull().default(false),
  fraudStrikes: integer("fraud_strikes").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false), // 2 strikes => admin review
  unpaidExpiries: integer("unpaid_expiries").notNull().default(0),
  bookingBanUntil: ts("booking_ban_until"),
  totpSecretEnc: text("totp_secret_enc"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  totpLastStep: integer("totp_last_step"),
  sessionVersion: integer("session_version").notNull().default(0), // bump = sign out everywhere
  ownerNote: text("owner_note"),
  bio: text("bio"),
  fullName: varchar("full_name", { length: 80 }), // set once at onboarding, then locked
  notifyPlanEmail: boolean("notify_plan_email").notNull().default(true),
  deactivatedAt: ts("deactivated_at"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const facilities = pgTable("facilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sportType: varchar("sport_type", { length: 50 }).notNull(),
  address: text("address").notNull(),
  location: geographyPoint("location").notNull(),
  priceNuPerHour: integer("price_nu_per_hour").notNull(), // whole Ngultrum
  bankDetails: text("bank_details").notNull(), // never returned until booking is PENDING_PAYMENT for that player
  isActive: boolean("is_active").notNull().default(true),
  aliases: text("aliases"), // local nicknames, searchable
  searchText: text("search_text").generatedAlwaysAs(sql`lower(name || ' ' || address || ' ' || coalesce(aliases, ''))`),
  approvalStatus: varchar("approval_status", { length: 12 }).notNull().default("PENDING"), // admin approves each listing
  createdAt: ts("created_at").defaultNow().notNull(),
}, (t) => [index("facilities_loc_idx").using("gist", t.location), index("facilities_trgm_idx").using("gin", t.searchText.op("gin_trgm_ops"))]);

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  facilityId: uuid("facility_id").notNull().references(() => facilities.id, { onDelete: "restrict" }),
  playerId: uuid("player_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  startTime: ts("start_time").notNull(),
  endTime: ts("end_time").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("PENDING_APPROVAL"),
  paymentDeadline: ts("payment_deadline"), // authoritative; QStash is only a trigger
  createdAt: ts("created_at").defaultNow().notNull(),
}, (t) => [index("bookings_fac_idx").on(t.facilityId, t.startTime)]);

export const paymentReceipts = pgTable("payment_receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  imageB64: text("image_b64").notNull(), // sanitized JPEG (<=1600px), served only via authorized route
  imageHash: varchar("image_hash", { length: 64 }).notNull().unique(), // SHA-256 of sanitized bytes
  uploadedAt: ts("uploaded_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  expiresAt: ts("expires_at"),
  receiptKey: text("receipt_key"),
  remindedAt: ts("reminded_at"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", { // append-only: enforced by trigger in sql/002
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id"), subjectId: uuid("subject_id"), // no FKs: FK actions would UPDATE rows and be blocked
  action: varchar("action", { length: 60 }).notNull(),
  metadata: jsonb("metadata"),
  at: ts("at").defaultNow().notNull(),
});

export const loginEvents = pgTable("login_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ua: text("ua"), ip: varchar("ip", { length: 64 }),
  at: ts("at").defaultNow().notNull(),
});

export const facilityBlocks = pgTable("facility_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  facilityId: uuid("facility_id").notNull().references(() => facilities.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 8 }).notNull(), // DATE | WEEKDAY
  onDate: date("on_date"), weekday: integer("weekday"), note: varchar("note", { length: 120 }),
  createdAt: ts("created_at").defaultNow().notNull(),
});
