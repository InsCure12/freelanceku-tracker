"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, TrendingUp, CalendarDays } from "lucide-react";
import StatusDropdown from "@/components/StatusDropdown";
import PaymentStatusDropdown from "@/components/PaymentStatusDropdown";
import CurrencyToggle from "@/components/CurrencyToggle";
import JobActions from "@/components/JobActions";
import EditJobModal from "@/components/EditJobModal";
import { useSearch } from "@/components/SearchProvider";
import AnimatedCounter from "@/components/AnimatedCounter";
import JobCalendar from "@/components/JobCalendar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  formatIDR,
  formatUSD,
  formatAmount,
  toIDR,
  toUSD,
} from "@/lib/currency";

interface FreeDashboardProps {
  userName: string;
  totalIncomeIDR: number;
  totalIncomeUSD: number;
  yearlyIncomeIDR: number;
  yearlyIncomeUSD: number;
  jobCount: number;
  recentJobs: {
    id: string;
    date: string;
    deadline: string | null;
    clientName: string;
    projectName: string | null;
    categoryName: string;
    amount: number;
    currency: string;
    status: string;
    paymentStatus: string;
  }[];
  categories: {
    id: string;
    name: string;
    icon: string | null;
    jobCount: number;
  }[];
  monthlyRevenueIDR: { month: string; revenue: number }[];
  monthlyRevenueUSD: { month: string; revenue: number }[];
  selectedMonth: string;
}

export default function FreeDashboard({
  userName,
  totalIncomeIDR,
  totalIncomeUSD,
  yearlyIncomeIDR,
  yearlyIncomeUSD,
  jobCount,
  recentJobs,
  categories,
  monthlyRevenueIDR,
  monthlyRevenueUSD,
  selectedMonth,
}: FreeDashboardProps) {
  const router = useRouter();
  const { query: searchQuery } = useSearch();
  const [cur, setCur] = useState<"IDR" | "USD">("IDR");
  const [editingJob, setEditingJob] = useState<
    (typeof recentJobs)[number] | null
  >(null);
  const [month, setMonth] = useState(selectedMonth);
  const isFullYear = /^\d{4}$/.test(month);

  const filteredJobs = recentJobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      j.clientName.toLowerCase().includes(q) ||
      (j.projectName || "").toLowerCase().includes(q) ||
      j.categoryName.toLowerCase().includes(q)
    );
  });

  const handleMonthChange = (value: string) => {
    setMonth(value);
    router.push(`/dashboard?month=${value}`);
    router.refresh();
  };

  const handleYearToggle = () => {
    const year = month.slice(0, 4);
    if (isFullYear) {
      const m = `${year}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      handleMonthChange(m);
    } else {
      handleMonthChange(year);
    }
  };

  const heroAmount = cur === "IDR" ? totalIncomeIDR : totalIncomeUSD;
  const heroSub =
    cur === "IDR"
      ? `≈ $${formatUSD(totalIncomeUSD)}`
      : `≈ Rp ${formatIDR(totalIncomeIDR)}`;

  return (
    <div className="space-y-6">
      {/* Month Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest rounded-xl px-4 py-3 lg:px-5">
        <CalendarDays size={18} className="text-outline" />
        <span className="text-sm font-medium text-on-surface-variant hidden sm:block">
          Period:
        </span>
        <input
          type="month"
          value={isFullYear ? "" : month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="px-3 py-1.5 bg-surface-container-high rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleYearToggle}
          className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors ${
            isFullYear
              ? "bg-primary text-on-primary"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
          }`}
        >
          Whole Year {month.slice(0, 4)}
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Income Hero */}
        <div className="lg:col-span-8 bg-gradient-to-br from-primary via-primary-container to-tertiary-container rounded-3xl p-6 lg:p-8 text-on-primary animate-fade-in-up relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-tertiary-container opacity-90"></div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-on-primary/70">
                Total Income This Month
              </p>
              <CurrencyToggle currency={cur} onChange={setCur} />
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              <h2 className="text-3xl lg:text-5xl font-extrabold tabular-nums tracking-tight">
                <AnimatedCounter
                  value={heroAmount}
                  prefix={cur === "IDR" ? "Rp " : "$"}
                  formatter={(v) =>
                    cur === "IDR" ? formatIDR(v) : formatUSD(v)
                  }
                />
              </h2>
              <span className="flex items-center gap-1 text-sm text-on-primary/80">
                <TrendingUp size={16} /> 12%
              </span>
            </div>
            <div className="pt-3 flex items-center gap-3">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg">
                <span className="text-sm">💱</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[0.65rem] text-on-primary/60 uppercase font-medium">
                  Conversion
                </span>
                <span className="text-base font-bold">{heroSub}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link
                href="/dashboard/work-log/new"
                className="flex items-center gap-2 px-4 lg:px-5 py-2.5 bg-surface-container-lowest text-primary rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors"
              >
                <PlusCircle size={16} strokeWidth={1.75} /> Log New Income
              </Link>
              <Link
                href="/dashboard/work-log"
                className="flex items-center gap-2 px-4 lg:px-5 py-2.5 bg-on-primary/10 text-on-primary rounded-xl text-sm font-semibold hover:bg-on-primary/20 transition-colors"
              >
                View Report
              </Link>
            </div>
          </div>
        </div>

        {/* Job Usage */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              Job Usage
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-secondary font-semibold uppercase">
              Free Tier
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-on-surface">
                <AnimatedCounter value={jobCount} />
              </span>
              <span className="text-lg text-outline">/ 50</span>
            </div>
            <p className="text-xs text-outline mt-1">
              You have used {Math.round((jobCount / 50) * 100)}% of your monthly
              job entries allowed in the free tier.
            </p>
          </div>
          <div className="mt-4 w-full h-2 rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary transition-all animate-progress"
              style={{ width: `${Math.min((jobCount / 50) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-outline mt-2 uppercase tracking-wider">
            Resets in {30 - new Date().getDate()} days
          </p>
        </div>
      </div>

      {/* Monthly Revenue Bar Chart */}
      {(() => {
        const monthlyRevenue =
          cur === "IDR" ? monthlyRevenueIDR : monthlyRevenueUSD;
        const yearlyTotal = cur === "IDR" ? yearlyIncomeIDR : yearlyIncomeUSD;
        const selectedMonthIndex = isFullYear
          ? -1
          : parseInt(month.slice(5, 7), 10) - 1;
        const selectedYear = month.slice(0, 4);

        return (
          <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 animate-fade-in-up delay-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 lg:mb-6">
              <div>
                <h3 className="text-sm lg:text-lg font-bold text-primary lg:text-on-surface">
                  Revenue Overview {selectedYear}
                </h3>
                <p className="text-xs text-outline">
                  Total tahun ini:{" "}
                  <span className="font-bold text-on-surface">
                    {cur === "IDR"
                      ? `Rp ${formatIDR(yearlyTotal)}`
                      : `$${formatUSD(yearlyTotal)}`}
                  </span>
                </p>
              </div>
              <CurrencyToggle currency={cur} onChange={setCur} />
            </div>
            <div className="h-48 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} barSize={24}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eceef0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#727780" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#727780" }}
                    axisLine={false}
                    tickLine={false}
                    className="hidden lg:block"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value) => [
                      cur === "IDR"
                        ? `Rp ${formatIDR(Number(value))}`
                        : `$${formatUSD(Number(value))}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {monthlyRevenue.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === selectedMonthIndex ? "#0f4c81" : "#c8d6e0"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

      {/* Categories + Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Categories */}
        <div className="lg:col-span-4 animate-slide-left delay-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-on-surface uppercase tracking-wide">
              Categories
            </h3>
            <button className="text-sm text-primary font-medium hover:underline">
              Manage
            </button>
          </div>
          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm text-outline">No categories yet.</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 hover-lift cursor-default animate-list-item"
                  style={{
                    animationDelay: `${0.4 + categories.indexOf(cat) * 0.08}s`,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-lg">
                    {cat.icon || "📁"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {cat.name}
                    </p>
                    <p className="text-xs text-outline">{cat.jobCount} Jobs</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="lg:col-span-8 animate-slide-right delay-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm lg:text-lg font-bold text-primary lg:text-on-surface uppercase tracking-wide">
              Recent Jobs
            </h3>
            <Link
              href="/dashboard/work-log"
              className="flex items-center gap-1 text-[0.65rem] lg:text-sm text-primary font-bold lg:font-medium uppercase lg:normal-case tracking-wider lg:tracking-normal hover:underline"
            >
              See all
            </Link>
          </div>

          {/* Mobile: Card list */}
          <div className="lg:hidden space-y-3">
            {filteredJobs.length === 0 ? (
              <div className="py-8 text-center text-sm text-outline">
                No jobs yet. Start by logging your first income!
              </div>
            ) : (
              filteredJobs.map((j) => {
                const statusColor: Record<string, string> = {
                  done: "bg-primary-fixed text-on-primary-fixed",
                  ongoing: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
                  pending: "bg-secondary-fixed text-on-secondary-fixed",
                  booked: "bg-secondary-fixed text-on-secondary-fixed",
                };
                return (
                  <div
                    key={j.id}
                    className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-sm font-bold text-on-primary-fixed">
                        {j.clientName.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-on-surface truncate">
                          {j.clientName}
                        </span>
                        {j.projectName && (
                          <span className="text-[0.65rem] text-outline truncate">
                            {j.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-3">
                      <span className="text-sm font-bold text-primary">
                        {cur === "IDR"
                          ? `Rp ${formatIDR(toIDR(j.amount, j.currency))}`
                          : `$${formatUSD(toUSD(j.amount, j.currency))}`}
                      </span>
                      <span
                        className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor[j.status] || "bg-surface-container text-outline"}`}
                      >
                        {j.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop: Table */}
          <div className="hidden lg:block bg-surface-container-lowest rounded-2xl overflow-visible">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-outline">
                  <th className="text-left py-4 px-5 font-semibold">Date</th>
                  <th className="text-left py-4 px-5 font-semibold">
                    Client / Job
                  </th>
                  <th className="text-left py-4 px-5 font-semibold">
                    Category
                  </th>
                  <th className="text-right py-4 px-5 font-semibold">Amount</th>
                  <th className="text-center py-4 px-5 font-semibold">
                    Status
                  </th>
                  <th className="text-center py-4 px-5 font-semibold">
                    Payment
                  </th>
                  <th className="text-center py-4 px-5 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-outline"
                    >
                      No jobs yet. Start by logging your first income!
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((j, idx) => (
                    <tr
                      key={j.id}
                      className="hover:bg-surface-container-low/50 row-highlight animate-list-item"
                      style={{ animationDelay: `${0.5 + idx * 0.06}s` }}
                    >
                      <td className="py-4 px-5 text-sm text-on-surface-variant">
                        {new Date(j.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm font-semibold text-on-surface">
                          {j.clientName}
                        </p>
                        {j.projectName && (
                          <p className="text-xs text-outline">
                            {j.projectName}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-container/50 text-secondary">
                          {j.categoryName}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right text-sm font-semibold text-on-surface">
                        {cur === "IDR"
                          ? `Rp ${formatIDR(toIDR(j.amount, j.currency))}`
                          : `$${formatUSD(toUSD(j.amount, j.currency))}`}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <StatusDropdown jobId={j.id} currentStatus={j.status} />
                      </td>
                      <td className="py-4 px-5 text-center">
                        <PaymentStatusDropdown
                          jobId={j.id}
                          currentStatus={j.paymentStatus}
                        />
                      </td>
                      <td className="py-4 px-5 text-center">
                        <JobActions
                          jobId={j.id}
                          onEdit={() => setEditingJob(j)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Job Calendar */}
      <JobCalendar jobs={recentJobs} />

      {/* Pro CTA Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-6 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 animate-fade-in-up delay-500">
        <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center shrink-0">
          <span className="text-tertiary text-xl">✦</span>
        </div>
        <div className="flex-1">
          <h3 className="text-base lg:text-lg font-bold text-on-surface">
            Scale your business with Architect Pro
          </h3>
          <p className="text-xs lg:text-sm text-on-surface-variant mt-1">
            Unlock unlimited jobs, automated invoicing, tax projections, and
            advanced financial analytics to take your freelancing to the next
            level.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Link
            href="/dashboard/settings"
            className="px-5 lg:px-6 py-2.5 lg:py-3 bg-error text-on-primary rounded-xl text-sm font-semibold hover:bg-error/90 transition-colors text-center"
          >
            Start Free Pro Trial
          </Link>
          <Link
            href="/#pricing"
            className="px-5 lg:px-6 py-2.5 lg:py-3 bg-surface-container-high text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-highest transition-colors text-center"
          >
            Compare Plans
          </Link>
        </div>
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} />
      )}

      {/* FAB */}
      <Link
        href="/dashboard/work-log/new"
        className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-container hover:scale-105 active:scale-95 transition-all animate-fab-pulse"
      >
        <PlusCircle size={24} strokeWidth={1.75} />
      </Link>
    </div>
  );
}
