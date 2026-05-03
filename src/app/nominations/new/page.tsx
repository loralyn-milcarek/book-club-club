import { redirect } from "next/navigation";
import { auth } from "@/auth";
import NominateBookForm from "./NominateBookForm";

export default async function NominateBookPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return <NominateBookForm />;
}
