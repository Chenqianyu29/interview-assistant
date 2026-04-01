import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { questionRecords } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const records = await db
    .select()
    .from(questionRecords)
    .where(eq(questionRecords.userId, user.userId))
    .orderBy(desc(questionRecords.createdAt));

  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [record] = await db
    .insert(questionRecords)
    .values({
      userId: user.userId,
      question: body.question,
      roleIdentity: body.roleSnapshot.identity,
      roleExperience: body.roleSnapshot.experience ?? null,
      roleScenario: body.roleSnapshot.scenario,
      answer: body.answer ?? "",
      starAnswer: body.starAnswer ?? "",
      followUps: body.followUps ?? [],
      parentId: body.parentId ?? null,
      folderId: body.folderId ?? null,
      category: body.category ?? "",
    })
    .returning();

  return NextResponse.json(record, { status: 201 });
}
