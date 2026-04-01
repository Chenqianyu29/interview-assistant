import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.userId))
    .limit(1);

  if (!settings) {
    return NextResponse.json({
      globalIdentity: "professional",
      globalExperience: "1-3y",
      globalScenario: "big-company",
    });
  }

  return NextResponse.json({
    globalIdentity: settings.globalIdentity,
    globalExperience: settings.globalExperience,
    globalScenario: settings.globalScenario,
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { globalIdentity, globalExperience, globalScenario } = await req.json();

  const [existing] = await db
    .select({ id: userSettings.id })
    .from(userSettings)
    .where(eq(userSettings.userId, user.userId))
    .limit(1);

  if (existing) {
    await db
      .update(userSettings)
      .set({
        globalIdentity,
        globalExperience: globalExperience ?? null,
        globalScenario,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, user.userId));
  } else {
    await db.insert(userSettings).values({
      userId: user.userId,
      globalIdentity,
      globalExperience: globalExperience ?? null,
      globalScenario,
    });
  }

  return NextResponse.json({ ok: true });
}
