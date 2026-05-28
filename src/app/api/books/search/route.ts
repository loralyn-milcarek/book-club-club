import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q?.trim()) return NextResponse.json({ items: [] });

  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", `intitle:${q}`);
  url.searchParams.set("maxResults", "6");
  url.searchParams.set("printType", "books");
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }

  const res = await fetch(url.toString());
  const data = await res.json();
  return NextResponse.json(data);
}
