"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Receipt, Calculator, Settings } from "lucide-react";

interface MobileNavProps {
  plan: "free" | "pro";
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/work-log", label: "Work Log", icon: FileText },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt, proOnly: true },
  { href: "/dashboard/tax-planner", label: "Planner", icon: Calculator, proOnly: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function MobileNav({ plan }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/70 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0_-4px_24px_0_rgba(25,28,30,0.04)] lg:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const isLocked = item.proOnly && plan === "free";
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={isLocked ? "#" : item.href}
            onClick={(e) => isLocked && e.preventDefault()}
            className={`flex flex-col items-center justify-center px-3 py-1.5 transition-all duration-200 ${
              isActive
                ? "bg-primary-fixed text-on-primary-fixed rounded-2xl scale-110"
                : isLocked
                  ? "text-outline/40"
                  : "text-outline hover:text-primary"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
            <span className="text-[10px] font-medium tracking-wide uppercase mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
