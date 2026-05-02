"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Format } from "@prisma/client";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function logProgress(bookId: string, formData: FormData) {
  const user = await requireUser();

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Book not found");

  const pageRaw = formData.get("page");
  const percentRaw = formData.get("percent");

  let page: number | null = null;
  let percent: number | null = null;

  if (percentRaw) {
    percent = Math.min(100, Math.max(0, parseFloat(percentRaw as string)));
  } else if (pageRaw) {
    page = parseInt(pageRaw as string, 10);
    if (book.totalPages) percent = (page / book.totalPages) * 100;
  }

  await prisma.readingSession.create({
    data: { userId: user.id, bookId, page, percent },
  });

  revalidatePath("/");
}

export async function toggleProgressVisibility() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) throw new Error("User not found");

  await prisma.user.update({
    where: { id: user.id },
    data: { progressPublic: !dbUser.progressPublic },
  });

  revalidatePath("/");
}

export async function addBook(formData: FormData) {
  await requireUser();

  const activeCount = await prisma.book.count({ where: { isActive: true } });
  if (activeCount >= 2) throw new Error("Maximum 2 active books at a time");

  const title = formData.get("title") as string;
  const author = (formData.get("author") as string) || null;
  const coverUrl = (formData.get("coverUrl") as string) || null;
  const openLibraryId = (formData.get("openLibraryId") as string) || null;
  const format = ((formData.get("format") as string) || "PRINT") as Format;
  const totalPages = formData.get("totalPages")
    ? parseInt(formData.get("totalPages") as string, 10)
    : null;
  const totalMinutes = formData.get("totalMinutes")
    ? parseInt(formData.get("totalMinutes") as string, 10)
    : null;
  const meetingDate = formData.get("meetingDate") as string | null;

  let meetingId: string | null = null;
  if (meetingDate) {
    const [y, m, d] = meetingDate.split("-").map(Number);
    const meeting = await prisma.meeting.create({
      data: { date: new Date(y, m - 1, d) },
    });
    meetingId = meeting.id;
  }

  await prisma.book.create({
    data: { title, author, coverUrl, openLibraryId, format, totalPages, totalMinutes, meetingId },
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateName(formData: FormData) {
  const user = await requireUser();
  const name = (formData.get("name") as string).trim();
  if (!name) throw new Error("Name cannot be empty");

  await prisma.user.update({ where: { id: user.id }, data: { name } });
  revalidatePath("/");
  redirect("/");
}

export async function setBookInactive(bookId: string) {
  await requireUser();
  await prisma.book.update({ where: { id: bookId }, data: { isActive: false } });
  revalidatePath("/");
}
