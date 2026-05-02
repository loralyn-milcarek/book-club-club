import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authConfig = {
  providers: [
    Resend({
      from: process.env.AUTH_RESEND_FROM_EMAIL,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
  },
  callbacks: {
    signIn({ user }) {
      const address = (user.email ?? "").toLowerCase();
      // Block the magic link from being sent to non-members.
      // On the verification click (no verificationRequest flag) we also check,
      // so a tampered link from an unknown address is rejected at session creation.
      if (allowedEmails.length > 0 && !allowedEmails.includes(address)) {
        return false;
      }
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/auth");

      if (isOnAuthPage) {
        return isLoggedIn ? Response.redirect(new URL("/", nextUrl)) : true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
