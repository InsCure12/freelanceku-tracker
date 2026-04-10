import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if user already has categories
  const existing = await db.query.category.findMany({
    where: eq(category.userId, session.user.id),
  });

  if (existing.length > 0) {
    return NextResponse.json({ message: "Categories already exist" });
  }

  // Seed default categories
  const defaults = [
    { name: "Photography", icon: "📷", color: "#00355f" },
  { name: "Web Design", icon: "🖥️", color: "#0d9488" },
    { name: "Consulting", icon: "💼", color: "#420096" },
  ];

  for (const cat of defaults) {
    await db.insert(category).values({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      userId: session.user.id,
    });
  }

  return NextResponse.json({ success: true });
}
