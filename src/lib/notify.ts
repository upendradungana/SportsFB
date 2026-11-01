import { sql } from "drizzle-orm"; import { db } from "@/db";
const run = (q: any) => db.execute(q).catch(() => {}); // a failed notification must never fail the action behind it
export const notifyUser = (userId: string, title: string, body: string, link: string) => run(sql`INSERT INTO notifications (user_id, title, body, link) VALUES (${userId}::uuid, ${title}, ${body}, ${link})`);
export const notifyAdmins = (title: string, body: string, link: string) => run(sql`INSERT INTO notifications (user_id, title, body, link) SELECT id, ${title}, ${body}, ${link} FROM users WHERE role = 'ADMIN'`);
export const notifyBookingOwner = (id: string, title: string, body: string, link: string) => run(sql`INSERT INTO notifications (user_id, title, body, link) SELECT f.owner_id, ${title}, ${body}, ${link} FROM bookings b JOIN facilities f ON f.id = b.facility_id WHERE b.id = ${id}::uuid`);
export const notifyBookingPlayer = (id: string, title: string, body: string, link: string) => run(sql`INSERT INTO notifications (user_id, title, body, link) SELECT b.player_id, ${title}, ${body}, ${link} FROM bookings b WHERE b.id = ${id}::uuid`);
