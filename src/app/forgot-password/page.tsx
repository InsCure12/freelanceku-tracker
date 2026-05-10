"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex">
        {/* Left - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-container items-center justify-center p-12">
          <div className="max-w-md text-on-primary">
            <h1 className="text-4xl font-bold">Jobsheet</h1>
            <p className="mt-4 text-lg text-primary-fixed/70">
              Precision-engineered financial tracking for the modern freelancer.
            </p>
          </div>
        </div>

        {/* Right - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-3xl font-bold text-on-surface">Check Your Email</h2>
              <p className="text-sm text-on-surface-variant mt-2">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
              <div className="text-sm text-on-surface-variant space-y-3">
                <p>✓ Check your email for the reset link</p>
                <p>✓ The link expires in 24 hours</p>
                <p>✓ Click the link to set a new password</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors"
              >
                Try Another Email
              </button>

              <p className="text-center text-sm text-on-surface-variant">
                Remember your password?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-container items-center justify-center p-12">
        <div className="max-w-md text-on-primary">
          <h1 className="text-4xl font-bold">Jobsheet</h1>
          <p className="mt-4 text-lg text-primary-fixed/70">
            Precision-engineered financial tracking for the modern freelancer.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center">
                🔐
              </div>
              <div>
                <p className="font-semibold">Secure Recovery</p>
                <p className="text-sm text-primary-fixed/60">
                  Quick and safe password reset
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface">Reset Password</h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-error-container text-error text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
