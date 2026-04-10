import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // In production, this would go through a payment gateway.
  // For now, directly upgrade the user.
  await db.update(user)
    .set({ plan: "pro", updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({ success: true, plan: "pro" });
}
