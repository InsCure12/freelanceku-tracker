"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });
      if (result.error) {
        setError(result.error.message || "Registration failed");
      } else {
        // Create default categories for the new user
        await fetch("/api/categories/seed", { method: "POST" });
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
          <h1 className="text-4xl font-bold">Start Building Your Empire</h1>
          <p className="mt-4 text-lg text-primary-fixed/70">
            Join thousands of freelancers who architect their finances with precision.
          </p>
          <div className="mt-8 p-6 bg-on-primary/10 rounded-2xl">
            <p className="text-sm font-semibold text-primary-fixed/80">Free Tier Includes:</p>
            <ul className="mt-3 space-y-2 text-sm text-primary-fixed/60">
              <li>✓ 50 job entries per month</li>
              <li>✓ 3 categories</li>
              <li>✓ 3-month history</li>
              <li>✓ CSV export</li>
              <li>✓ Basic dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface">Create Account</h2>
            <p className="text-sm text-on-surface-variant mt-2">Begin your precision freelancing journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-error-container text-error text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

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
                placeholder="Minimum 8 characters"
                className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
