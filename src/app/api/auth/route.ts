import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { compareSync } from "bcryptjs";
import { db } from "@/db";
import { users, userSettings } from "@/db/schema";
import { signJwt, authCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user || !compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1);

  const token = await signJwt({ userId: user.id, username: user.username });
  const res = NextResponse.json({
    user: user.username,
    userId: user.id,
    settings: settings
      ? {
          globalIdentity: settings.globalIdentity,
          globalExperience: settings.globalExperience,
          globalScenario: settings.globalScenario,
        }
      : null,
  });
  res.cookies.set(authCookieOptions(token));
  return res;
}
