import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import AddBookForm from "./AddBookForm";

export default async function AddBookPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return <AddBookForm users={users} currentUserId={session.user.id} />;
}
