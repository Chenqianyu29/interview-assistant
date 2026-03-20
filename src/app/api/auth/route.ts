import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (
    username !== process.env.DEMO_USER ||
    password !== process.env.DEMO_PASSWORD
  ) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  const res = NextResponse.json({ user: username });
  res.cookies.set("auth-token", username, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return res;
}
