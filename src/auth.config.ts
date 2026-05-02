import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";

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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/auth");

      if (isOnAuthPage) {
        // Redirect to home if already logged in
        return isLoggedIn ? Response.redirect(new URL("/", nextUrl)) : true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
