"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Sparkles, Wand2, Mail, MailCheck, Leaf } from "lucide-react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Failed to send magic link. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="text-blush" size={36} strokeWidth={1.5} />
            <Sparkles className="text-sage" size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-bold text-bark leading-tight">
            Book Club Club
          </h1>
          <p className="text-bark-muted">
            {submitted
              ? "Check your inbox!"
              : "We'll send a magic link to your email"}
          </p>
        </div>

        <div
          className="bg-parchment rounded-3xl p-7 border border-lace"
          style={{ boxShadow: "var(--shadow-warm-lg)" }}
        >
          {submitted ? (
            <div className="text-center space-y-3 py-2">
              <MailCheck className="mx-auto text-sage" size={40} strokeWidth={1.5} />
              <p className="font-semibold text-bark text-lg">
                Magic link sent!
              </p>
              <p className="text-bark-muted text-sm leading-relaxed">
                We sent a link to{" "}
                <span className="font-medium text-bark">{email}</span>.
                Click it to sign in — it expires in 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setEmail(""); }}
                className="mt-2 text-sm text-blush hover:text-blush-dark underline underline-offset-2 transition-colors cursor-pointer"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 rounded-2xl bg-blush-light px-4 py-3 text-sm text-bark border border-blush/20">
                  <Leaf className="text-blush shrink-0 mt-0.5" size={15} strokeWidth={2} />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-bark"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-muted"
                    size={16}
                    strokeWidth={1.75}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-2xl border border-lace bg-cream pl-10 pr-4 py-3 text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-blush px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-blush-dark hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                style={{ boxShadow: "var(--shadow-warm)" }}
              >
                <Wand2 size={16} strokeWidth={2} />
                {isLoading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-bark-muted">
          No account needed — just your email
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
