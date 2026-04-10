"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, ChevronRight, PlusCircle } from "lucide-react";

interface TaxPlannerClientProps {
  totalIncome: number;
  monthlyData: { month: string; income: number }[];
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}

export default function TaxPlannerClient({ totalIncome, monthlyData }: TaxPlannerClientProps) {
  const estimatedTax = totalIncome * 0.10;
  const smartSavings = totalIncome * 0.023;
  const projectedGross = totalIncome;
  const netProfit = totalIncome - estimatedTax;

  const strategies = [
    {
      title: "SEP IRA Contribution Optimization",
      badge: "High Impact",
      badgeColor: "bg-primary text-on-primary",
      description: "Maxing out your SEP IRA contributions could reduce your taxable income based on current revenue.",
      meta: ["Verified Logic", `Potential: Rp ${formatIDR(totalIncome * 0.015)} Saved`],
    },
    {
      title: "Section 179 Equipment Deduction",
      badge: "Time Sensitive",
      badgeColor: "bg-tertiary text-on-tertiary",
      description: "New laptop and office hardware purchases qualify for immediate 100% deduction in this tax year.",
      meta: ["Ends Dec 31", "Potential: Rp 9.762.000 Saved"],
    },
    {
      title: "Home Office Utility Proration",
      badge: "Optimization",
      badgeColor: "bg-secondary text-on-secondary",
      description: "Updated floor plan measurements suggest you can increase your deduction by 4.2%.",
      meta: ["Automated Audit", "Potential: Rp 2.204.000 Saved"],
    },
  ];

  const deadlines = [
    { month: "Oct", day: "15", title: "Q3 Estimated Payments", type: "IRS Federal" },
    { month: "Nov", day: "20", title: "VAT Reporting Period", type: "Regional Revenue" },
    { month: "Jan", day: "15", title: "Q4 Final Settlement", type: "Annual Closure" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
        <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Tax Planner</h1>
        <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-tertiary text-on-tertiary">
          Predictive Logic Enabled
        </span>
      </div>

      {/* Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
          <p className="text-[10px] uppercase tracking-wider text-outline">Real-Time Estimated Tax</p>
          <p className="text-3xl lg:text-5xl font-bold text-on-surface mt-2">Rp {formatIDR(estimatedTax)}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-[#16a34a]">↘ 12.5% decrease from last projection</span>
            <span className="text-xs text-outline">Next payment due: Oct 15</span>
          </div>
          <div className="flex justify-center mt-4">
            <button className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-xs font-semibold">
              Current Projection
            </button>
          </div>

          {/* Mini Bar Chart */}
          <div className="h-32 lg:h-40 mt-6">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef0" vertical={false} />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="income" fill="#0f4c81" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-gradient-to-br from-tertiary to-tertiary/80 rounded-2xl p-5 lg:p-6 text-on-tertiary">
          <p className="text-[10px] uppercase tracking-wider text-on-tertiary/60">Smart Savings Found</p>
          <p className="text-3xl lg:text-4xl font-bold mt-2">Rp {formatIDR(smartSavings)}</p>
          <p className="text-sm text-on-tertiary/70 mt-3">
            Our logic engine identified 4 new deductible expenses and 1 tax credit you qualify for this quarter.
          </p>
          <button className="mt-6 px-4 py-2.5 bg-on-tertiary text-tertiary rounded-xl text-sm font-semibold hover:bg-on-tertiary/90 transition-colors w-full">
            Review Strategies →
          </button>
        </div>
      </div>

      {/* Strategies + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Savings Strategies */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💡</span>
            <h2 className="text-lg font-bold text-on-surface">Tax Savings Strategies</h2>
          </div>
          <div className="space-y-4">
            {strategies.map((s, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-on-surface">{s.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">{s.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  {s.meta.map((m, j) => (
                    <span key={j} className="text-[10px] text-outline flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline/50" /> {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines + Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📅</span>
              <h2 className="text-lg font-bold text-on-surface">Tax Deadlines</h2>
            </div>
            <div className="space-y-3">
              {deadlines.map((d, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">{d.month}</p>
                    <p className="text-2xl font-bold text-on-surface">{d.day}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{d.title}</p>
                    <p className="text-xs text-outline uppercase tracking-wider">{d.type}</p>
                  </div>
                  <ChevronRight size={16} className="text-outline" />
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Breakdown */}
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary">📊</span>
              <h3 className="text-sm font-bold text-on-surface">Predictive Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Projected Gross</span>
                <span className="text-sm font-semibold text-on-surface">Rp {formatIDR(projectedGross)}</span>
              </div>
              <div className="w-full h-1.5 bg-primary/20 rounded-full">
                <div className="h-full bg-primary rounded-full w-full" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Tax Liabilities</span>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-tertiary text-on-tertiary rounded-lg text-xs font-semibold">
                    <PlusCircle size={12} strokeWidth={1.75} /> Manual Tax Entry
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-surface-container-high">
                <span className="text-sm text-on-surface-variant">Net Profit (Est)</span>
                <span className="text-sm font-bold text-[#16a34a]">Rp {formatIDR(netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
