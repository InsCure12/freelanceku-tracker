import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const foundUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!foundUser) {
      // For security, don't reveal if user exists
      return NextResponse.json(
        { message: "If an account exists with this email, we've sent a reset link" },
        { status: 200 }
      );
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Find and update account with reset token
    const userAccount = await db.query.account.findFirst({
      where: eq(account.userId, foundUser.id),
    });

    if (!userAccount) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 }
      );
    }

    // Update account with reset token
    await db
      .update(account)
      .set({
        passwordResetToken: resetToken,
        passwordResetTokenExpiresAt: tokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccount.id));

    // In production, send email here with reset link
    // For development, log to console
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    console.log(`\n🔗 Password Reset Link for ${email}:\n${resetLink}\n`);

    return NextResponse.json(
      { message: "If an account exists with this email, we've sent a reset link" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
