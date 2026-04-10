import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, category } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NewJobForm from "./NewJobForm";

export default async function NewJobPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });
  const plan = userData?.plan || "free";

  const categories = await db.query.category.findMany({
    where: eq(category.userId, session.user.id),
  });

  return <NewJobForm plan={plan as "free" | "pro"} categories={categories} />;
}
