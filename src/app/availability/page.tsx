import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import AvailabilityCalendar from "./AvailabilityCalendar";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = session.user.id;

  const [allUsers, allBlocks] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.memberAvailability.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const myBlocks = allBlocks
    .filter((b) => b.userId === userId)
    .map((b) => b.date.toISOString().split("T")[0]);

  type BlocksByDate = Record<string, { name: string; email: string | null }[]>;
  const blocksByDate: BlocksByDate = {};
  for (const block of allBlocks) {
    const key = block.date.toISOString().split("T")[0];
    if (!blocksByDate[key]) blocksByDate[key] = [];
    blocksByDate[key].push({
      name: block.user.name || (block.user.email ?? "").split("@")[0],
      email: block.user.email,
    });
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <header className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-bark">Availability</h1>
            <p className="text-sm text-bark-muted">Mark dates you can&apos;t make it</p>
          </div>
        </header>

        <AvailabilityCalendar
          myBlocks={myBlocks}
          blocksByDate={blocksByDate}
          currentUserId={userId}
        />
      </div>
    </main>
  );
}
