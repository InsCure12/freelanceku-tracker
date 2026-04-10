import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import MobileNav from "@/components/MobileNav";
import { SearchProvider } from "@/components/SearchProvider";
import { db } from "@/lib/db";
import { user as userTable, job } from "@/lib/db/schema";
import { eq, and, not, inArray } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });

  const plan = (userData?.plan as "free" | "pro") || "free";

  // Fetch all non-done jobs for notifications
  const activeJobs = await db.query.job.findMany({
    where: and(
      eq(job.userId, session.user.id),
      not(inArray(job.status, ["done"])),
    ),
    columns: { id: true, clientName: true, projectName: true, date: true, deadline: true, status: true },
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  type NotifType = "deadline" | "upcoming" | "pending";
  const notifications: {
    id: string;
    type: NotifType;
    clientName: string;
    projectName: string | null;
    date: string;
    deadline: string | null;
    status: string;
    daysLeft: number;
    label: string;
  }[] = [];

  for (const j of activeJobs) {
    // 1. Deadline alerts (overdue or within 7 days)
    if (j.deadline) {
      const dl = new Date(j.deadline);
      const diff = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 7) {
        notifications.push({
          ...j, type: "deadline", daysLeft: diff,
          label: diff < 0 ? `Overdue by ${Math.abs(diff)}d` : diff === 0 ? "Due today!" : `${diff}d until deadline`,
        });
      }
    }

    // 2. Upcoming job dates (job date within 3 days from now, or today)
    const jobDate = new Date(j.date);
    const dateDiff = Math.ceil((jobDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (dateDiff >= 0 && dateDiff <= 3 && (j.status === "booked" || j.status === "pending")) {
      notifications.push({
        ...j, type: "upcoming", daysLeft: dateDiff,
        label: dateDiff === 0 ? "Scheduled today" : `Starts in ${dateDiff}d`,
      });
    }

    // 3. Pending/booked jobs not yet started
    if (j.status === "pending" || j.status === "booked") {
      const jobDate2 = new Date(j.date);
      const pastDays = Math.ceil((today.getTime() - jobDate2.getTime()) / (1000 * 60 * 60 * 24));
      if (pastDays > 0) {
        notifications.push({
          ...j, type: "pending", daysLeft: pastDays,
          label: `Not started · ${pastDays}d overdue`,
        });
      }
    }
  }

  // Sort: overdue deadline first, then upcoming, then pending
  const typeOrder: Record<NotifType, number> = { deadline: 0, upcoming: 1, pending: 2 };
  notifications.sort((a, b) => {
    if (a.type !== b.type) return typeOrder[a.type] - typeOrder[b.type];
    return a.daysLeft - b.daysLeft;
  });

  return (
    <SearchProvider>
      <div className="min-h-screen bg-surface">
        <Sidebar plan={plan} userName={session.user.name} />
        <div className="lg:ml-64">
          <TopNav plan={plan} userName={session.user.name} notifications={notifications} />
          <main className="px-4 py-4 lg:p-6 pb-28 lg:pb-6">{children}</main>
        </div>
        <MobileNav plan={plan} />
      </div>
    </SearchProvider>
  );
}
