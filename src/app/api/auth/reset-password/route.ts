import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Find account with matching reset token that hasn't expired
    const userAccount = await db.query.account.findFirst({
      where: and(
        eq(account.passwordResetToken, token),
      ),
    });

    if (!userAccount) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (
      !userAccount.passwordResetTokenExpiresAt ||
      userAccount.passwordResetTokenExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    // Update account with new password and clear reset token
    await db
      .update(account)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccount.id));

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
