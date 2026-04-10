import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });

  return (
    <SettingsClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        plan: (userData?.plan as "free" | "pro") || "free",
        companyName: userData?.companyName || "",
        taxId: userData?.taxId || "",
        businessAddress: userData?.businessAddress || "",
        defaultCurrency: (userData?.defaultCurrency as "IDR" | "USD") || "IDR",
      }}
    />
  );
}
