"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({
        email,
        password,
      });
      if (result.error) {
        setError(result.error.message || "Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-container items-center justify-center p-12">
        <div className="max-w-md text-on-primary">
          <h1 className="text-4xl font-bold">The Fiscal Architect</h1>
          <p className="mt-4 text-lg text-primary-fixed/70">
            Precision-engineered financial tracking for the modern freelancer.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center">📊</div>
              <div>
                <p className="font-semibold">Track Every Job</p>
                <p className="text-sm text-primary-fixed/60">Log income with architectural precision</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center">💰</div>
              <div>
                <p className="font-semibold">Monitor Payments</p>
                <p className="text-sm text-primary-fixed/60">Know exactly who owes what</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center">📄</div>
              <div>
                <p className="font-semibold">Generate Invoices</p>
                <p className="text-sm text-primary-fixed/60">Professional PDFs in seconds</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface">Welcome Back</h2>
            <p className="text-sm text-on-surface-variant mt-2">Sign in to your Fiscal Architect account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-error-container text-error text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Get Started Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
