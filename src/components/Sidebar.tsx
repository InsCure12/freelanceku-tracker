"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Calculator,
  Settings,
  HelpCircle,
  LogOut,
  Lock,
  ChevronUp,
  Users,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface SidebarProps {
  plan: "free" | "pro";
  userName?: string;
  userImage?: string;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    proOnly: false,
  },
  {
    href: "/dashboard/work-log",
    label: "Work Log",
    icon: FileText,
    proOnly: false,
  },
  { href: "/dashboard/clients", label: "Clients", icon: Users, proOnly: false },
  {
    href: "/dashboard/invoices",
    label: "Invoices",
    icon: Receipt,
    proOnly: true,
  },
  {
    href: "/dashboard/tax-planner",
    label: "Tax Planner",
    icon: Calculator,
    proOnly: true,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    proOnly: false,
  },
];

export default function Sidebar({ plan, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary flex-col hidden lg:flex">
      {/* Brand */}
      <div className="px-6 py-6">
        <Link href="/dashboard" className="block">
          <h1 className="text-on-primary font-bold text-lg">Jobsheet</h1>
          <p className="text-primary-fixed/60 text-xs tracking-wider uppercase mt-0.5">
            {plan === "pro" ? "Precision Finance" : "Free Tier"}
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isLocked = item.proOnly && plan === "free";
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={isLocked ? "#" : item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium nav-item ${
                isActive
                  ? "bg-on-primary/15 text-on-primary"
                  : "text-primary-fixed/70 hover:bg-on-primary/10 hover:text-on-primary"
              } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {isLocked && <Lock size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-2">
        {plan === "free" ? (
          <div className="mx-1 p-4 rounded-xl bg-tertiary/90 text-on-tertiary">
            <p className="text-xs font-semibold uppercase tracking-wider">
              Pro Features Locked
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-2 block w-full text-center py-2 rounded-lg bg-on-primary text-primary text-sm font-semibold hover:bg-on-primary/90 transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : (
          <div className="mx-1 p-4 rounded-xl bg-tertiary/90 text-on-tertiary">
            <p className="text-[10px] font-semibold uppercase tracking-wider">
              Status
            </p>
            <p className="text-sm font-bold">PRO Tier Active</p>
            <div className="mt-2 w-full h-1 rounded-full bg-on-tertiary/30">
              <div className="h-full w-full rounded-full bg-on-tertiary" />
            </div>
          </div>
        )}

        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-2.5 text-primary-fixed/60 hover:text-on-primary text-sm transition-colors"
        >
          <HelpCircle size={18} />
          <span>{plan === "free" ? "Support" : "Help Center"}</span>
        </Link>

        <button
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/login";
                },
              },
            })
          }
          className="flex items-center gap-3 px-4 py-2.5 text-primary-fixed/60 hover:text-on-primary text-sm transition-colors w-full"
        >
          <LogOut size={18} />
          <span>{plan === "free" ? "Log Out" : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}
