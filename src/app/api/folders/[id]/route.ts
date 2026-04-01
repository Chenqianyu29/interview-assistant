import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favoriteFolders, questionRecords } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name } = await req.json();

  const [updated] = await db
    .update(favoriteFolders)
    .set({ name })
    .where(
      and(
        eq(favoriteFolders.id, Number(id)),
        eq(favoriteFolders.userId, user.userId),
      ),
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const folderId = Number(id);

  const recordsInFolder = await db
    .select({ id: questionRecords.id })
    .from(questionRecords)
    .where(eq(questionRecords.folderId, folderId))
    .limit(1);

  if (recordsInFolder.length > 0) {
    return NextResponse.json(
      { error: "文件夹内还有记录，无法删除" },
      { status: 409 },
    );
  }

  const [deleted] = await db
    .delete(favoriteFolders)
    .where(
      and(
        eq(favoriteFolders.id, folderId),
        eq(favoriteFolders.userId, user.userId),
      ),
    )
    .returning({ id: favoriteFolders.id });

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
