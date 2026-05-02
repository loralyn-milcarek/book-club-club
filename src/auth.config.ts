import type { NextAuthConfig } from "next-auth";

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
  },
  callbacks: {
    signIn({ user }) {
      const address = (user.email ?? "").toLowerCase();
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

      if (!isLoggedIn) {
        return Response.redirect(new URL("/auth/signin", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
