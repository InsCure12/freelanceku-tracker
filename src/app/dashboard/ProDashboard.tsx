"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, ExternalLink, TrendingUp, ClipboardCopy, CalendarDays } from "lucide-react";
import StatusDropdown from "@/components/StatusDropdown";
import CurrencyToggle from "@/components/CurrencyToggle";
import JobActions from "@/components/JobActions";
import EditJobModal from "@/components/EditJobModal";
import { useSearch } from "@/components/SearchProvider";
import { formatIDR, formatUSD, formatAmount, formatAmountAlt, toIDR, toUSD } from "@/lib/currency";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const PIE_COLORS = ["#00355f", "#0d9488", "#420096", "#e07830", "#c2185b"];

interface ProDashboardProps {
  userName: string;
  yearlyIncomeUSD: number;
  yearlyIncomeIDR: number;
  monthlyIncomeIDR: number;
  monthlyIncomeUSD: number;
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
  }[];
  categories: { id: string; name: string; icon: string | null; jobCount: number }[];
  monthlyRevenueIDR: { month: string; revenue: number }[];
  monthlyRevenueUSD: { month: string; revenue: number }[];
  projectedRevenueIDR: number;
  projectedRevenueUSD: number;
  bookedCount: number;
  ongoingCount: number;
  selectedMonth: string;
}

export default function ProDashboard({
  userName,
  yearlyIncomeUSD,
  yearlyIncomeIDR,
  monthlyIncomeIDR,
  monthlyIncomeUSD,
  jobCount,
  recentJobs,
  categories,
  monthlyRevenueIDR,
  monthlyRevenueUSD,
  projectedRevenueIDR,
  projectedRevenueUSD,
  bookedCount,
  ongoingCount,
  selectedMonth,
}: ProDashboardProps) {
  const router = useRouter();
  const { query: searchQuery } = useSearch();
  const [cur, setCur] = useState<"IDR" | "USD">("IDR");
  const [editingJob, setEditingJob] = useState<typeof recentJobs[number] | null>(null);
  const [month, setMonth] = useState(selectedMonth);
  const isFullYear = /^\d{4}$/.test(month);

  const filteredJobs = recentJobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return j.clientName.toLowerCase().includes(q) || (j.projectName || "").toLowerCase().includes(q) || j.categoryName.toLowerCase().includes(q);
  });

  const handleMonthChange = (value: string) => {
    setMonth(value);
    router.push(`/dashboard?month=${value}`);
    router.refresh();
  };

  const handleYearToggle = () => {
    const year = month.slice(0, 4);
    if (isFullYear) {
      // Switch back to current month of that year
      const m = `${year}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      handleMonthChange(m);
    } else {
      handleMonthChange(year);
    }
  };

  const yearlyTotal = cur === "IDR" ? yearlyIncomeIDR : yearlyIncomeUSD;
  const yearlySub = cur === "IDR" ? `≈ $${formatUSD(yearlyIncomeUSD)}` : `≈ Rp ${formatIDR(yearlyIncomeIDR)}`;
  const netRevenue = yearlyTotal * 0.83;
  const projectedTax = yearlyTotal * 0.10;
  const efficiency = yearlyTotal > 0 ? 83.4 : 0;
  const monthlyRevenue = cur === "IDR" ? monthlyRevenueIDR : monthlyRevenueUSD;

  const projectedRevenue = cur === "IDR" ? projectedRevenueIDR : projectedRevenueUSD;
  const totalPipeline = yearlyTotal + projectedRevenue;
  const confirmedPct = totalPipeline > 0 ? (yearlyTotal / totalPipeline) * 100 : 0;
  const projectedPct = totalPipeline > 0 ? (projectedRevenue / totalPipeline) * 100 : 0;

  const categoryPieData = categories
    .filter((c) => c.jobCount > 0)
    .map((c) => ({ name: c.name, value: c.jobCount }));

  const fmt = (v: number) => cur === "IDR" ? `Rp ${formatIDR(v)}` : `$${formatUSD(v)}`;

  return (
    <div className="space-y-6">
      {/* Header with Currency Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg lg:text-2xl font-bold text-on-surface">The Fiscal Architect</h1>
          <CurrencyToggle currency={cur} onChange={setCur} />
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest rounded-xl px-4 py-3 lg:px-5">
        <CalendarDays size={18} className="text-outline" />
        <span className="text-sm font-medium text-on-surface-variant hidden sm:block">Period:</span>
        <input
          type="month"
          value={isFullYear ? '' : month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="px-3 py-1.5 bg-surface-container-high rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleYearToggle}
          className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors ${
            isFullYear
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          Whole Year {month.slice(0, 4)}
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Revenue Hero */}
        <div className="lg:col-span-8 bg-gradient-to-br from-primary via-primary-container to-tertiary-container rounded-3xl p-6 lg:p-8 text-on-primary animate-fade-in-up relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-tertiary-container opacity-90"></div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left: Total Invoiced */}
            <div className="flex-1">
              <p className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-on-primary/70">Total Invoiced (YTD)</p>
              <h2 className="text-3xl lg:text-5xl font-extrabold mt-2 tabular-nums tracking-tight">{fmt(yearlyTotal)}</h2>
              <div className="pt-4 flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg">
                  <span className="text-sm">💱</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.65rem] text-on-primary/60 uppercase font-medium">Conversion</span>
                  <span className="text-base lg:text-lg font-bold">{yearlySub}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 lg:gap-8 mt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-primary/50">Net Revenue</p>
                  <p className="text-base lg:text-lg font-bold">{fmt(netRevenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-primary/50">Projected Tax</p>
                  <p className="text-base lg:text-lg font-bold">{fmt(projectedTax)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-primary/50">Efficiency</p>
                  <p className="text-base lg:text-lg font-bold">{efficiency}%</p>
                </div>
              </div>
            </div>

            {/* Right: Projected Revenue */}
            <div className="lg:w-64 flex flex-col justify-between rounded-xl bg-white/10 backdrop-blur-sm p-4 lg:p-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-on-primary/60">Projected Revenue</p>
                <p className="text-xl lg:text-2xl font-bold mt-1">{fmt(projectedRevenue)}</p>
                <p className="text-xs text-on-primary/50 mt-0.5">
                  {bookedCount + ongoingCount} job{bookedCount + ongoingCount !== 1 ? "s" : ""} in pipeline
                </p>
              </div>

              {/* Stacked bar */}
              <div className="mt-4">
                <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
                  {confirmedPct > 0 && (
                    <div
                      className="bg-[#4ade80] rounded-l-full transition-all duration-700"
                      style={{ width: `${confirmedPct}%` }}
                    />
                  )}
                  {projectedPct > 0 && (
                    <div
                      className="bg-[#ea580c] transition-all duration-700"
                      style={{ width: `${projectedPct}%` }}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-on-primary/60">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80]" /> Confirmed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ea580c]" /> Booked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Active Projects</h3>
            <span className="text-primary">⚡</span>
          </div>
          <div className="mt-4 space-y-3">
            {filteredJobs
              .filter((j) => j.status === "ongoing")
              .slice(0, 3)
              .map((j) => (
                <div key={j.id} className="flex items-center justify-between py-2">
                  <p className="text-sm font-medium text-on-surface">{j.clientName}</p>
                  <p className="text-sm text-outline">
                    {cur === "IDR"
                      ? `Rp ${formatIDR(toIDR(j.amount, j.currency))}`
                      : `$${formatUSD(toUSD(j.amount, j.currency))}`}/mo
                  </p>
                </div>
              ))}
            {filteredJobs.filter((j) => j.status === "ongoing").length === 0 && (
              <p className="text-sm text-outline py-2">No active projects</p>
            )}
          </div>
          <Link
            href="/dashboard/work-log"
            className="flex items-center gap-1 text-sm text-primary font-medium mt-4 hover:underline"
          >
            Go to Work Log <ExternalLink size={14} strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-4 lg:p-6 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <h3 className="text-sm lg:text-lg font-bold text-primary lg:text-on-surface">Revenue Growth</h3>
              <p className="text-xs text-outline hidden lg:block">Past 12 months trajectory</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium bg-surface-container-high rounded-lg text-on-surface-variant hidden lg:block">
              Annual View
            </button>
          </div>
          <div className="h-40 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#727780" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#727780" }} axisLine={false} tickLine={false} className="hidden lg:block" />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="revenue" fill="#0f4c81" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income by Category */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-4 lg:p-6 animate-scale-in delay-400">
          <h3 className="text-lg font-bold text-on-surface mb-4">Income by Category</h3>
          {categoryPieData.length > 0 ? (
            <div className="h-56 animate-chart-reveal delay-500">
              <ResponsiveContainer width="100%" height={224}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {categoryPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-outline py-8 text-center">No data yet</p>
          )}
        </div>
      </div>

      {/* Professional Ledger */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-visible animate-fade-in-up delay-500">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <h3 className="text-sm lg:text-lg font-bold text-primary lg:text-on-surface">Active Projects</h3>
          <button className="text-[0.65rem] font-bold text-primary uppercase tracking-wider lg:hidden">See all</button>
          <div className="hidden lg:flex gap-2">
            <button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </button>
          </div>
        </div>

        {/* Mobile: Card list */}
        <div className="lg:hidden space-y-3 px-4 pb-4">
          {filteredJobs.length === 0 ? (
            <div className="py-8 text-center text-sm text-outline">No jobs yet. Start logging your work!</div>
          ) : (
            filteredJobs.map((j) => {
              const statusColor: Record<string, string> = {
                done: "bg-primary-fixed text-on-primary-fixed",
                ongoing: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
                pending: "bg-secondary-fixed text-on-secondary-fixed",
                booked: "bg-secondary-fixed text-on-secondary-fixed",
              };
              return (
                <div key={j.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-sm font-bold text-on-primary-fixed">
                      {j.clientName.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-on-surface truncate">{j.clientName}</span>
                      {j.projectName && <span className="text-[0.65rem] text-outline truncate">{j.projectName}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-3">
                    <span className="text-sm font-bold text-primary">
                      {cur === "IDR"
                        ? `Rp ${formatIDR(toIDR(j.amount, j.currency))}`
                        : `$${formatUSD(toUSD(j.amount, j.currency))}`}
                    </span>
                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor[j.status] || "bg-surface-container text-outline"}`}>
                      {j.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop: Table */}
        <table className="w-full hidden lg:table">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-outline">
              <th className="text-left py-3 px-6 font-semibold">Client / Job</th>
              <th className="text-left py-3 px-6 font-semibold">Date</th>
              <th className="text-left py-3 px-6 font-semibold">Deadline</th>
              <th className="text-right py-3 px-6 font-semibold">Amount</th>
              <th className="text-right py-3 px-6 font-semibold">Converted</th>
              <th className="text-center py-3 px-6 font-semibold">Status</th>
              <th className="text-center py-3 px-6 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-outline">
                  No jobs yet. Start logging your work!
                </td>
              </tr>
            ) : (
              filteredJobs.map((j, idx) => (
                <tr key={j.id} className="hover:bg-surface-container-low/50 row-highlight animate-list-item" style={{ animationDelay: `${0.6 + idx * 0.06}s` }}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-sm font-bold text-on-primary-fixed">
                        {j.clientName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{j.clientName}</p>
                        {j.projectName && <p className="text-xs text-outline">{j.projectName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface-variant">
                    {new Date(j.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {j.deadline && j.status !== "done"
                      ? (() => {
                          const now = new Date();
                          const dl = new Date(j.deadline);
                          const diff = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          const color = diff < 0 ? "text-error font-semibold" : diff <= 3 ? "text-error" : diff <= 7 ? "text-orange-500" : "text-on-surface-variant";
                          return (
                            <span className={color}>
                              {dl.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {diff < 0 && <span className="ml-1 text-[10px]">overdue</span>}
                              {diff >= 0 && diff <= 3 && <span className="ml-1 text-[10px]">{diff}d left</span>}
                              {diff > 3 && diff <= 7 && <span className="ml-1 text-[10px]">{diff}d left</span>}
                            </span>
                          );
                        })()
                      : j.deadline
                        ? <span className="text-on-surface-variant">{new Date(j.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        : <span className="text-outline">—</span>}
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-semibold text-on-surface">
                    {cur === "IDR"
                      ? `Rp ${formatIDR(toIDR(j.amount, j.currency))}`
                      : `$${formatUSD(toUSD(j.amount, j.currency))}`}
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-outline">
                    {cur === "IDR"
                      ? `$${formatUSD(toUSD(j.amount, j.currency))}`
                      : `Rp ${formatIDR(toIDR(j.amount, j.currency))}`}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <StatusDropdown jobId={j.id} currentStatus={j.status} />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <JobActions jobId={j.id} onEdit={() => setEditingJob(j)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredJobs.length > 0 && (
          <div className="px-6 py-4 text-center">
            <Link href="/dashboard/work-log" className="text-sm text-primary font-medium hover:underline">
              View Full Ledger History
            </Link>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} />
      )}

      {/* FAB */}
      <Link
        href="/dashboard/work-log/new"
        className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-container hover:scale-105 active:scale-95 transition-all z-40"
      >
        <PlusCircle size={24} strokeWidth={1.75} />
      </Link>
    </div>
  );
}
