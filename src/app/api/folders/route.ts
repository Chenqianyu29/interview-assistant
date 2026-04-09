import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { favoriteFolders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

function serializeFolder(row: typeof favoriteFolders.$inferSelect) {
  return {
    id: Number(row.id),
    name: row.name,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(favoriteFolders)
    .where(eq(favoriteFolders.userId, user.userId))
    .orderBy(favoriteFolders.sortOrder);

  return NextResponse.json(rows.map(serializeFolder));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();

  const [row] = await db
    .insert(favoriteFolders)
    .values({ userId: user.userId, name })
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }

  return NextResponse.json(serializeFolder(row), { status: 201 });
}
