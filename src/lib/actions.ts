"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Format } from "@prisma/client";
import { put, del } from "@vercel/blob";

function parseMeetingDate(str: string): Date {
  const [datePart, timePart = "00:00"] = str.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

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
  const meetingActivity = (formData.get("meetingActivity") as string) || null;
  const meetingNotes = (formData.get("meetingNotes") as string) || null;

  const meeting = await prisma.meeting.create({
    data: { date: parseMeetingDate(meetingDate), location: meetingLocation, activity: meetingActivity, notes: meetingNotes },
  });
  const meetingId = meeting.id;

  const suggestedByUserId =
    (formData.get("suggestedByUserId") as string) || user.id;
  const nominationId = (formData.get("nominationId") as string) || null;

  await prisma.book.create({
    data: {
      title, author, coverUrl, openLibraryId, format, totalPages, totalMinutes, meetingId,
      suggestedByUserId,
    },
  });

  if (nominationId) {
    await prisma.bookNomination.update({
      where: { id: nominationId },
      data: { status: "SELECTED" },
    });
  }

  revalidatePath("/");
  revalidatePath("/nominations");
  redirect("/");
}

export async function createMeeting(formData: FormData) {
  await requireUser();

  const dateStr = formData.get("date") as string;
  const location = (formData.get("location") as string) || null;
  const activity = (formData.get("activity") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const meeting = await prisma.meeting.create({
    data: { date: parseMeetingDate(dateStr), location, activity, notes },
  });

  revalidatePath("/");
  revalidatePath("/meetings");
  redirect(`/meetings/${meeting.id}`);
}

export async function updateMeeting(meetingId: string, formData: FormData) {
  await requireUser();

  const dateStr = formData.get("date") as string;
  const location = (formData.get("location") as string) || null;
  const activity = (formData.get("activity") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { date: parseMeetingDate(dateStr), location, activity, notes },
  });

  revalidatePath("/");
  revalidatePath("/meetings");
  revalidatePath(`/meetings/${meetingId}`);
  redirect(`/meetings/${meetingId}`);
}

export async function rateMeeting(meetingId: string, formData: FormData) {
  const user = await requireUser();

  const iconsRaw = formData.get("icons") as string;
  const icons = iconsRaw
    ? iconsRaw.split(",").map((i) => i.trim()).filter(Boolean).slice(0, 3)
    : [];

  await prisma.meetingRating.upsert({
    where: { meetingId_userId: { meetingId, userId: user.id } },
    create: { meetingId, userId: user.id, icons },
    update: { icons },
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

export async function nominateBook(formData: FormData) {
  const user = await requireUser();

  const title = (formData.get("title") as string).trim();
  const author = (formData.get("author") as string | null) || null;
  const coverUrl = (formData.get("coverUrl") as string | null) || null;
  const openLibraryId = (formData.get("openLibraryId") as string | null) || null;
  const blurb = (formData.get("blurb") as string).trim();

  if (!title || !blurb) throw new Error("Title and pitch are required");

  const olDescription = (formData.get("olDescription") as string | null) || null;
  const olRatingRaw = formData.get("olRating");
  const olRatingCountRaw = formData.get("olRatingCount");
  const olRating = olRatingRaw ? parseFloat(olRatingRaw as string) : null;
  const olRatingCount = olRatingCountRaw ? parseInt(olRatingCountRaw as string, 10) : null;

  await prisma.bookNomination.create({
    data: { title, author, coverUrl, openLibraryId, blurb, olDescription, olRating, olRatingCount, nominatedByUserId: user.id },
  });

  revalidatePath("/nominations");
  redirect("/nominations");
}

export async function toggleNominationVote(nominationId: string, voteType: "UP" | "DOWN") {
  const user = await requireUser();

  const existing = await prisma.nominationVote.findUnique({
    where: { nominationId_userId: { nominationId, userId: user.id } },
  });

  if (existing) {
    if (existing.voteType === voteType) {
      await prisma.nominationVote.delete({ where: { id: existing.id } });
    } else {
      await prisma.nominationVote.update({ where: { id: existing.id }, data: { voteType } });
    }
  } else {
    await prisma.nominationVote.create({ data: { nominationId, userId: user.id, voteType } });
  }

  revalidatePath("/nominations");
}

export async function archiveNomination(nominationId: string) {
  await requireUser();
  await prisma.bookNomination.update({
    where: { id: nominationId },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/nominations");
}

export async function restoreNomination(nominationId: string) {
  await requireUser();
  await prisma.bookNomination.update({
    where: { id: nominationId },
    data: { status: "ACTIVE" },
  });
  revalidatePath("/nominations");
}

export async function uploadActivityPhoto(meetingId: string, formData: FormData) {
  const user = await requireUser();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided");

  const caption = (formData.get("caption") as string | null) || null;

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `book-club-club/${meetingId}/${Date.now()}.${ext}`;
  const blob = await put(filename, file, { access: "public" });

  await prisma.activityPhoto.create({
    data: { meetingId, url: blob.url, caption, uploadedByUserId: user.id },
  });

  revalidatePath(`/meetings/${meetingId}`);
}

export async function deleteActivityPhoto(photoId: string) {
  const user = await requireUser();

  const photo = await prisma.activityPhoto.findUnique({ where: { id: photoId } });
  if (!photo) throw new Error("Photo not found");
  if (photo.uploadedByUserId !== user.id) throw new Error("Not your photo");

  await del(photo.url);
  await prisma.activityPhoto.delete({ where: { id: photoId } });
  revalidatePath(`/meetings/${photo.meetingId}`);
}

export async function addGalleryComment(meetingId: string, formData: FormData) {
  const user = await requireUser();

  const text = (formData.get("text") as string).trim();
  if (!text) throw new Error("Comment cannot be empty");

  await prisma.galleryComment.create({
    data: { meetingId, userId: user.id, text },
  });

  revalidatePath(`/meetings/${meetingId}`);
}

export async function deleteGalleryComment(commentId: string) {
  const user = await requireUser();

  const comment = await prisma.galleryComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Comment not found");
  if (comment.userId !== user.id) throw new Error("Not your comment");

  await prisma.galleryComment.delete({ where: { id: commentId } });
  revalidatePath(`/meetings/${comment.meetingId}`);
}
