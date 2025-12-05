import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import fs from "fs";
import path from "path";

config({
  path: ".env.local",
});

const runMigrate = async () => {
  if (process.env.SKIP_DB_MIGRATE === "true") {
    console.warn("⚠️  SKIP_DB_MIGRATE is set. Skipping migrations during build.");
    process.exit(0);
  }

  if (!process.env.POSTGRES_URL) {
    console.warn("⚠️  POSTGRES_URL is not defined. Skipping migrations during build.");
    process.exit(0);
  }

  // Check if migrations folder has any SQL files
  const migrationsPath = path.join(process.cwd(), "./lib/db/migrations");
  const files = fs.readdirSync(migrationsPath);
  const hasMigrations = files.some((file) => file.endsWith(".sql"));

  if (!hasMigrations) {
    console.warn("⚠️  No migration files found. Skipping migrations during build.");
    process.exit(0);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log("⏳ Running migrations...");

  const start = Date.now();
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
