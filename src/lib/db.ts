import "server-only";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { relations } from "@/db/relations";

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  timezone: "Z",
});

poolConnection.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

export const db = drizzle({ client: poolConnection, relations });
