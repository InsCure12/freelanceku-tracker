"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleCheck, Wallet } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  companyName: string;
  taxId: string;
  businessAddress: string;
  defaultCurrency: "IDR" | "USD";
}

export default function SettingsClient({ user }: { user: UserData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    companyName: user.companyName,
    taxId: user.taxId,
    businessAddress: user.businessAddress,
    defaultCurrency: user.defaultCurrency,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/upgrade", { method: "POST" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Identity */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Profile Identity</h2>
                <p className="text-[10px] uppercase tracking-wider text-outline">Personal Information</p>
              </div>
              <span className="text-on-surface-variant">👤</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-outline"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Security</label>
                  <button className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface-variant text-left hover:bg-surface-container-high transition-colors">
                    Change Password &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Business Details</h2>
                <p className="text-[10px] uppercase tracking-wider text-outline">Invoicing & Tax Entities</p>
              </div>
              <span className="text-on-surface-variant">🏢</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Registered Company Name</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Your company name"
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Tax ID / VAT Registration</label>
                  <input
                    type="text"
                    value={form.taxId}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                    placeholder="e.g. NPWP number"
                    className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Default Currency</label>
                  <select
                    value={form.defaultCurrency}
                    onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value as "IDR" | "USD" })}
                    disabled={user.plan === "free"}
                    className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  >
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Business Address</label>
                <textarea
                  value={form.businessAddress}
                  onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                  placeholder="Your business address"
                  rows={3}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Plan */}
          <div className={`rounded-2xl p-6 ${
            user.plan === "pro"
              ? "bg-gradient-to-br from-primary to-primary-container text-on-primary"
              : "bg-surface-container-lowest"
          }`}>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-tertiary text-on-tertiary">
                Active Plan
              </span>
              {user.plan === "pro" && <span className="text-xl">✦</span>}
            </div>
            <h3 className={`text-2xl font-bold italic mt-3 ${user.plan === "pro" ? "" : "text-on-surface"}`}>
              {user.plan === "pro" ? "ARCHITECT PRO" : "FREE TIER"}
            </h3>
            {user.plan === "pro" && (
              <p className="text-xs text-primary-fixed/60 mt-1">Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            )}
            <div className="mt-4 space-y-2">
              {user.plan === "pro" ? (
                <>
                  <div className="flex items-center gap-2 text-sm"><CircleCheck size={14} strokeWidth={1.75} className="text-primary-fixed" /> Unlimited Tax Projections</div>
                  <div className="flex items-center gap-2 text-sm"><CircleCheck size={14} strokeWidth={1.75} className="text-primary-fixed" /> Smart Invoice Automation</div>
                  <div className="flex items-center gap-2 text-sm"><CircleCheck size={14} strokeWidth={1.75} className="text-primary-fixed" /> Multi-Currency Support</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">• 50 jobs per month</div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">• 3 categories</div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">• 3-month history</div>
                </>
              )}
            </div>
            <button
              onClick={user.plan === "free" ? handleUpgrade : undefined}
              className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                user.plan === "pro"
                  ? "bg-on-primary text-primary hover:bg-on-primary/90"
                  : "bg-primary text-on-primary hover:bg-primary-container"
              }`}
            >
              {user.plan === "pro" ? "Manage Subscription" : "Upgrade to Pro — Rp 29k/mo"}
            </button>
          </div>

          {/* Payment Method (Pro) */}
          {user.plan === "pro" && (
            <div className="bg-surface-container-lowest rounded-2xl p-6">
              <h3 className="text-sm font-bold text-on-surface mb-4">Payment Method</h3>
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                <div className="w-10 h-7 bg-primary rounded flex items-center justify-center text-on-primary text-[10px] font-semibold">VISA</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">Visa ending in 4422</p>
                  <p className="text-xs text-outline">Expires 11/28</p>
                </div>
                <button className="text-xs text-primary font-semibold hover:underline">Edit</button>
              </div>
              <button className="w-full mt-3 py-2.5 bg-surface-container-high rounded-xl text-sm text-on-surface-variant font-medium hover:bg-surface-container-highest transition-colors">
                Add Backup Method
              </button>
            </div>
          )}

          {/* Regional Settings */}
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <h3 className="text-sm font-bold text-on-surface mb-4">Regional Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Timezone</span>
                <span className="font-medium text-on-surface">PT (GMT-8)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Language</span>
                <span className="font-medium text-on-surface">English (US)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Date Format</span>
                <span className="font-medium text-on-surface">MM/DD/YYYY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Bar */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <button className="px-6 py-3 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
          Discard Changes
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={16} strokeWidth={1.75} /> Save Architect Profile
        </button>
      </div>
    </div>
  );
}
