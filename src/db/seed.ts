import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle({ client: sql, schema });

  const username = process.env.DEMO_USER ?? "demo";
  const password = process.env.DEMO_PASSWORD ?? "demo123";
  const passwordHash = hashSync(password, 10);

  await db
    .insert(schema.users)
    .values({ username, passwordHash })
    .onConflictDoNothing({ target: schema.users.username });

  console.log(`Seeded user: ${username}`);
}

seed().catch(console.error);
