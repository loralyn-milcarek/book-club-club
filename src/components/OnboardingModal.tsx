"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Lightbulb,
  UsersRound,
  Calendar,
  Settings,
  ArrowRight,
  X,
} from "lucide-react";
import { completeOnboarding } from "@/lib/actions";

const STEPS = [
  {
    icon: (
      <div className="flex items-center justify-center gap-2">
        <BookOpen className="text-blush" size={40} strokeWidth={1.5} />
      </div>
    ),
    title: "Welcome to Book Club Club!",
    body: "This is your shared hub for everything book club — reading progress, upcoming meetings, photos, and more. Let's take a quick look around.",
  },
  {
    icon: (
      <div className="flex items-center justify-center gap-3">
        <BookOpen className="text-blush" size={28} strokeWidth={1.5} />
      </div>
    ),
    title: "Your homepage",
    body: "The homepage shows the book you're currently reading, everyone's reading progress, and your next upcoming meeting. Everything you need at a glance.",
  },
  {
    icon: (
      <div className="flex items-center justify-center gap-3">
        <Lightbulb className="text-sage" size={24} strokeWidth={1.75} />
        <UsersRound className="text-blush" size={24} strokeWidth={1.75} />
        <Calendar className="text-bark-muted" size={24} strokeWidth={1.75} />
        <Settings className="text-bark-muted" size={24} strokeWidth={1.75} />
      </div>
    ),
    title: "Getting around",
    body: (
      <ul className="space-y-2 text-left text-sm text-bark-muted">
        <li className="flex items-start gap-2">
          <Lightbulb size={15} className="text-sage mt-0.5 shrink-0" strokeWidth={1.75} />
          <span><strong className="text-bark">Nominations</strong> — suggest books and vote on what to read next</span>
        </li>
        <li className="flex items-start gap-2">
          <UsersRound size={15} className="text-blush mt-0.5 shrink-0" strokeWidth={1.75} />
          <span><strong className="text-bark">Meetings</strong> — view past meetings, add photos, and see ratings</span>
        </li>
        <li className="flex items-start gap-2">
          <Calendar size={15} className="text-bark-muted mt-0.5 shrink-0" strokeWidth={1.75} />
          <span><strong className="text-bark">Availability</strong> — mark dates you can't make it so everyone can coordinate</span>
        </li>
        <li className="flex items-start gap-2">
          <Settings size={15} className="text-bark-muted mt-0.5 shrink-0" strokeWidth={1.75} />
          <span><strong className="text-bark">Settings</strong> — update your profile and preferences</span>
        </li>
      </ul>
    ),
  },
  {
    icon: (
      <div className="flex items-center justify-center">
        <Settings className="text-blush" size={40} strokeWidth={1.5} />
      </div>
    ),
    title: "One last thing",
    body: (
      <>
        <p className="text-bark-muted text-sm">
          Head to Settings to set your display name so your friends know it&apos;s you when you log your progress or leave a comment.
        </p>
        <Link
          href="/settings"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-blush px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          Go to Settings
          <ArrowRight size={14} strokeWidth={2} />
        </Link>
      </>
    ),
  },
];

export default function OnboardingModal({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show);
  const [step, setStep] = useState(0);
  const [, startTransition] = useTransition();

  if (!visible) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  function dismiss() {
    setVisible(false);
    startTransition(() => completeOnboarding());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark/40 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm bg-parchment rounded-3xl p-7 space-y-5 border border-lace"
        style={{ boxShadow: "var(--shadow-warm)" }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
          aria-label="Close"
        >
          <X size={16} strokeWidth={2} />
        </button>

        <div className="flex justify-center">{current.icon}</div>

        <div className="space-y-2 text-center">
          <h2 className="font-display text-xl font-bold text-bark">{current.title}</h2>
          <div className="text-sm text-bark-muted leading-relaxed">
            {typeof current.body === "string" ? <p>{current.body}</p> : current.body}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 rounded-full transition-all ${
                  i === step ? "w-4 bg-blush" : "w-1.5 bg-lace"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-xs text-bark-muted hover:text-bark transition-colors px-2 py-1"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={dismiss}
                className="flex items-center gap-1.5 rounded-full bg-blush px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5"
                style={{ boxShadow: "var(--shadow-warm)" }}
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 rounded-full bg-blush px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5"
                style={{ boxShadow: "var(--shadow-warm)" }}
              >
                Next
                <ArrowRight size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
