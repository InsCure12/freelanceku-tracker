"use client";

import { useEffect, useRef, useState } from "react";
import { useSearch } from "@/components/SearchProvider";
import {
  BellRing,
  CircleHelp,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Clock,
  XCircle,
  CalendarClock,
  CirclePause,
} from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "deadline" | "upcoming" | "pending";
  clientName: string;
  projectName: string | null;
  date: string;
  deadline: string | null;
  status: string;
  daysLeft: number;
  label: string;
}

interface TopNavProps {
  plan: "free" | "pro";
  userName?: string;
  notifications?: Notification[];
}

function NotifDropdown({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/15 overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-on-surface">Notifications</h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-error/10 text-error font-semibold">
          {notifications.length} alert{notifications.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-outline">
            All clear — no alerts
          </div>
        ) : (
          notifications.map((n, i) => {
            const icon =
              n.type === "deadline" ? (
                n.daysLeft < 0 ? (
                  <XCircle size={16} />
                ) : n.daysLeft <= 3 ? (
                  <AlertTriangle size={16} />
                ) : (
                  <Clock size={16} />
                )
              ) : n.type === "upcoming" ? (
                <CalendarClock size={16} />
              ) : (
                <CirclePause size={16} />
              );
            const iconStyle =
              n.type === "deadline"
                ? n.daysLeft <= 0
                  ? "bg-error/10 text-error"
                  : n.daysLeft <= 3
                    ? "bg-error/10 text-error"
                    : "bg-orange-500/10 text-orange-500"
                : n.type === "upcoming"
                  ? "bg-primary/10 text-primary"
                  : "bg-orange-500/10 text-orange-500";
            const labelColor =
              n.type === "deadline"
                ? n.daysLeft <= 3
                  ? "text-error"
                  : "text-orange-500"
                : n.type === "upcoming"
                  ? "text-primary"
                  : "text-orange-500";
            const bgColor =
              n.type === "deadline" && n.daysLeft < 0
                ? "bg-error/5"
                : n.type === "pending"
                  ? "bg-orange-500/5"
                  : "";
            const typeLabel =
              n.type === "deadline"
                ? "Deadline"
                : n.type === "upcoming"
                  ? "Upcoming"
                  : "Not started";

            return (
              <div
                key={`${n.type}-${n.id}-${i}`}
                className={`px-4 py-3 border-b border-outline-variant/5 last:border-b-0 ${bgColor}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${iconStyle}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {n.clientName}
                      </p>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${iconStyle}`}
                      >
                        {typeLabel}
                      </span>
                    </div>
                    {n.projectName && (
                      <p className="text-xs text-outline truncate">
                        {n.projectName}
                      </p>
                    )}
                    <p className={`text-xs mt-1 font-medium ${labelColor}`}>
                      {n.label}
                      {n.type === "deadline" && n.deadline && (
                        <>
                          {" · "}
                          <span className="text-outline font-normal">
                            {new Date(n.deadline).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </>
                      )}
                      {n.type === "upcoming" && (
                        <>
                          {" · "}
                          <span className="text-outline font-normal">
                            {new Date(n.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function TopNav({
  plan,
  userName,
  notifications = [],
}: TopNavProps) {
  const { query, setQuery } = useSearch();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifDesktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node) &&
        notifDesktopRef.current &&
        !notifDesktopRef.current.contains(e.target as Node)
      ) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-200">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-6 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary text-sm font-bold">
            {(userName || "U").charAt(0).toUpperCase()}
          </div>
          <span className="text-lg font-bold text-primary tracking-tight">
            Jobsheet
          </span>
        </div>
        {/* Mobile Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-10 h-10 flex items-center justify-center text-primary hover:bg-surface-container-high/50 rounded-full transition-all relative"
          >
            <BellRing size={22} strokeWidth={1.75} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {showNotifs && <NotifDropdown notifications={notifications} />}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              plan === "free"
                ? "Search jobs or clients..."
                : "Search entries..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-high/50 text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-4">
          {/* Notifications */}
          <div ref={notifDesktopRef} className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-lg hover:bg-surface-container-high/50 text-on-surface-variant transition-colors relative"
            >
              <BellRing size={20} strokeWidth={1.75} />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifs && <NotifDropdown notifications={notifications} />}
          </div>
          <button className="p-2 rounded-lg hover:bg-surface-container-high/50 text-on-surface-variant transition-colors">
            <CircleHelp size={20} strokeWidth={1.75} />
          </button>
          {plan === "pro" && (
            <Link
              href="/dashboard/settings"
              className="p-2 rounded-lg hover:bg-surface-container-high/50 text-on-surface-variant transition-colors"
            >
              <SlidersHorizontal size={20} strokeWidth={1.75} />
            </Link>
          )}
          {/* Profile */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-on-surface-variant hidden sm:block">
              {userName || "User"}
            </span>
            {plan === "free" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-secondary uppercase tracking-wider font-semibold hidden sm:block">
                Free Plan
              </span>
            )}
            {plan === "pro" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary uppercase tracking-wider font-semibold hidden sm:block">
                Pro Tier
              </span>
            )}
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-semibold">
              {(userName || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
