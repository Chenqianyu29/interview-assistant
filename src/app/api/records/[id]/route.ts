import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { questionRecords } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  if (body.answer !== undefined) patch.answer = body.answer;
  if (body.starAnswer !== undefined) patch.starAnswer = body.starAnswer;
  if (body.followUps !== undefined) patch.followUps = body.followUps;
  if (body.folderId !== undefined) patch.folderId = body.folderId;
  if (body.category !== undefined) patch.category = body.category;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  patch.updatedAt = new Date();

  const [updated] = await db
    .update(questionRecords)
    .set(patch)
    .where(
      and(
        eq(questionRecords.id, Number(id)),
        eq(questionRecords.userId, user.userId),
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

  const [deleted] = await db
    .delete(questionRecords)
    .where(
      and(
        eq(questionRecords.id, Number(id)),
        eq(questionRecords.userId, user.userId),
      ),
    )
    .returning({ id: questionRecords.id });

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
