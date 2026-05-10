"use client";

import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordLoading() {
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

      {/* Right - Loading */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface">Loading...</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
