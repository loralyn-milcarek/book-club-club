import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import AddBookForm from "./AddBookForm";

export default async function AddBookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { nominationId } = await searchParams;

  const [users, nomination] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    typeof nominationId === "string"
      ? prisma.bookNomination.findUnique({ where: { id: nominationId } })
      : null,
  ]);

  const preSelected = nomination
    ? {
        title: nomination.title,
        author: nomination.author ?? "",
        coverUrl: nomination.coverUrl ?? "",
        openLibraryId: nomination.openLibraryId ?? "",
        totalPages: null as number | null,
      }
    : null;

  return (
    <AddBookForm
      users={users}
      currentUserId={session.user.id}
      preSelected={preSelected}
      nominationId={typeof nominationId === "string" ? nominationId : null}
    />
  );
}
