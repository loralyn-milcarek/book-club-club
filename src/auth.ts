import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Resend from "next-auth/providers/resend";
import { Resend as ResendClient } from "resend";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/db";

function magicLinkEmail(url: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in to Book Club Club</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#4A3728;letter-spacing:-0.5px;">
                📚 Book Club Club
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#F5EDE3;border-radius:24px;border:1px solid #E8D9CF;padding:36px 32px;box-shadow:0 4px 24px rgba(74,55,40,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#4A3728;">
                      Sign in to Book Club Club
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:28px;">
                    <p style="margin:0;font-size:15px;color:#9B8070;line-height:1.6;">
                      Click the button below to sign in. This link expires in 24 hours and can only be used once.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${url}" style="display:inline-block;background-color:#C4768A;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:100px;">
                      Sign in ✨
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #E8D9CF;padding-top:20px;">
                    <p style="margin:0;font-size:12px;color:#9B8070;line-height:1.6;">
                      If you didn't request this, you can safely ignore it — nothing will happen.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Resend({
      from: process.env.AUTH_RESEND_FROM_EMAIL,
      async sendVerificationRequest({ identifier, url, provider }) {
        const resend = new ResendClient(process.env.AUTH_RESEND_KEY);
        await resend.emails.send({
          from: provider.from as string,
          to: identifier,
          subject: "Sign in to Book Club Club",
          html: magicLinkEmail(url),
          text: `Sign in to Book Club Club\n\nClick this link to sign in:\n${url}\n\nThis link expires in 24 hours. If you didn't request it, you can safely ignore this email.`,
        });
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
