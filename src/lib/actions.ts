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
  const user = await requireUser();

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
  const meetingDate = formData.get("meetingDate") as string;
  const meetingLocation = (formData.get("meetingLocation") as string) || null;
  const meetingNotes = (formData.get("meetingNotes") as string) || null;

  const [y, m, d] = meetingDate.split("-").map(Number);
  const meeting = await prisma.meeting.create({
    data: { date: new Date(y, m - 1, d), location: meetingLocation, notes: meetingNotes },
  });
  const meetingId = meeting.id;

  const suggestedByUserId =
    (formData.get("suggestedByUserId") as string) || user.id;

  await prisma.book.create({
    data: {
      title, author, coverUrl, openLibraryId, format, totalPages, totalMinutes, meetingId,
      suggestedByUserId,
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function createMeeting(formData: FormData) {
  await requireUser();

  const dateStr = formData.get("date") as string;
  const location = (formData.get("location") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const [y, m, d] = dateStr.split("-").map(Number);
  const meeting = await prisma.meeting.create({
    data: { date: new Date(y, m - 1, d), location, notes },
  });

  revalidatePath("/");
  revalidatePath("/meetings");
  redirect(`/meetings/${meeting.id}`);
}

export async function updateMeeting(meetingId: string, formData: FormData) {
  await requireUser();

  const dateStr = formData.get("date") as string;
  const location = (formData.get("location") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const [y, m, d] = dateStr.split("-").map(Number);
  await prisma.meeting.update({
    where: { id: meetingId },
    data: { date: new Date(y, m - 1, d), location, notes },
  });

  revalidatePath("/");
  revalidatePath("/meetings");
  revalidatePath(`/meetings/${meetingId}`);
  redirect(`/meetings/${meetingId}`);
}

export async function rateMeeting(meetingId: string, formData: FormData) {
  const user = await requireUser();

  const emojisRaw = formData.get("emojis") as string;
  const emojis = emojisRaw
    ? emojisRaw.split(",").map((e) => e.trim()).filter(Boolean).slice(0, 3)
    : [];

  await prisma.meetingRating.upsert({
    where: { meetingId_userId: { meetingId, userId: user.id } },
    create: { meetingId, userId: user.id, emojis },
    update: { emojis },
  });

  revalidatePath("/meetings");
  revalidatePath(`/meetings/${meetingId}`);
}

export async function toggleAvailability(dateStr: string) {
  const user = await requireUser();

  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  const existing = await prisma.memberAvailability.findUnique({
    where: { userId_date: { userId: user.id, date } },
  });

  if (existing) {
    await prisma.memberAvailability.delete({ where: { id: existing.id } });
  } else {
    await prisma.memberAvailability.create({ data: { userId: user.id, date } });
  }

  revalidatePath("/availability");
}

export async function archiveMeeting(meetingId: string) {
  await requireUser();
  await prisma.meeting.update({
    where: { id: meetingId },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/");
  revalidatePath("/meetings");
  redirect("/meetings");
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

export async function setBookActive(bookId: string) {
  await requireUser();
  await prisma.book.update({ where: { id: bookId }, data: { isActive: true } });
  revalidatePath("/");
  revalidatePath("/meetings");
}
