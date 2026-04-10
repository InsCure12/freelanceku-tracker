import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, companyName, taxId, businessAddress, defaultCurrency } = body;

  const allowedCurrencies = ["IDR", "USD"];
  const currency = allowedCurrencies.includes(defaultCurrency) ? defaultCurrency : "IDR";

  await db.update(user)
    .set({
      name: name || undefined,
      companyName: companyName || null,
      taxId: taxId || null,
      businessAddress: businessAddress || null,
      defaultCurrency: currency,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({ success: true });
}
