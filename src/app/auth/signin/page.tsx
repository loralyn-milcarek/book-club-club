"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";

import { useSearchParams } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-slate-900">
          Book Club Club
        </h1>

        {submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold text-slate-900">
              Check your email!
            </p>
            <p className="text-slate-600">
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-slate-500">
              Click the link in your email to sign in. The link expires in 24 hours.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-8 text-center text-slate-600">
              Sign in with your email
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send magic link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
