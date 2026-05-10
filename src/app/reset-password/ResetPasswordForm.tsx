"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold text-on-surface">Password Reset</h2>
              <p className="text-sm text-on-surface-variant mt-2">
                Your password has been successfully reset!
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 mb-6">
              <p className="text-sm text-on-surface-variant text-center">
                Redirecting to login page in a moment...
              </p>
            </div>

            <Link
              href="/login"
              className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors text-center block"
            >
              Go to Sign In
            </Link>
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
                <p className="font-semibold">Create New Password</p>
                <p className="text-sm text-primary-fixed/60">
                  Make it strong and secure
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
            <h2 className="text-3xl font-bold text-on-surface">Create New Password</h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Enter your new password below
            </p>
          </div>

          {!token ? (
            <div className="p-4 rounded-xl bg-error-container text-error text-sm text-center">
              <p className="font-semibold mb-2">Invalid Reset Link</p>
              <p>This password reset link is invalid or has expired.</p>
              <Link
                href="/forgot-password"
                className="inline-block mt-4 text-primary font-semibold hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-error-container text-error text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                  New Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-outline/50 hover:text-outline"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

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
