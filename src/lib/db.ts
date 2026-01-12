import { drizzle } from "drizzle-orm/mysql2";
import { relations } from "@/db/relations";

export const db = drizzle(process.env.DATABASE_URL!, { relations });