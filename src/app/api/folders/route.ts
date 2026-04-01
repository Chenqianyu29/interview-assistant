import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { favoriteFolders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await db
    .select()
    .from(favoriteFolders)
    .where(eq(favoriteFolders.userId, user.userId))
    .orderBy(favoriteFolders.sortOrder);

  return NextResponse.json(folders);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();

  const [folder] = await db
    .insert(favoriteFolders)
    .values({ userId: user.userId, name })
    .returning();

  return NextResponse.json(folder, { status: 201 });
}
