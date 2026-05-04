"use client";

import { useState, useTransition } from "react";
import { addBook } from "@/lib/actions";
import { BookOpen, Search, Loader2, ArrowLeft } from "lucide-react";
import CoverImage from "@/components/CoverImage";
import Link from "next/link";

type GBVolume = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

type SelectedBook = {
  title: string;
  author: string;
  coverUrl: string;
  volumeId: string;
  totalPages: number | null;
};

type User = { id: string; name: string | null; email: string | null };

function displayName(u: User) {
  return u.name || (u.email ?? "").split("@")[0];
}

function getCoverUrl(vol: GBVolume): string {
  const raw = vol.volumeInfo.imageLinks?.thumbnail ?? vol.volumeInfo.imageLinks?.smallThumbnail ?? "";
  return raw.replace("http://", "https://").replace("&edge=curl", "");
}

export default function AddBookForm({
  users,
  currentUserId,
  preSelected = null,
  nominationId = null,
}: {
  users: User[];
  currentUserId: string;
  preSelected?: SelectedBook | null;
  nominationId?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GBVolume[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SelectedBook | null>(preSelected);
  const [isPending, startTransition] = useTransition();

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&maxResults=6&printType=books`
      );
      const data = await res.json();
      setResults(data.items ?? []);
    } finally {
      setSearching(false);
    }
  }

  function selectBook(vol: GBVolume) {
    setSelected({
      title: vol.volumeInfo.title,
      author: vol.volumeInfo.authors?.[0] ?? "",
      coverUrl: getCoverUrl(vol),
      volumeId: vol.id,
      totalPages: vol.volumeInfo.pageCount ?? null,
    });
    setResults([]);
    setQuery("");
  }

  function handleSubmit(formData: FormData) {
    if (selected) {
      formData.set("title", selected.title);
      formData.set("author", selected.author);
      formData.set("coverUrl", selected.coverUrl);
      formData.set("googleBooksId", selected.volumeId);
      if (selected.totalPages) formData.set("totalPages", String(selected.totalPages));
    }
    if (nominationId) formData.set("nominationId", nominationId);
    startTransition(() => addBook(formData));
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
          <h1 className="font-display text-2xl font-bold text-bark">Add a book</h1>
        </div>

        <div
          className="bg-parchment rounded-3xl p-6 border border-lace space-y-5"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          {selected ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-sage-light border border-sage/20">
              {selected.coverUrl && (
                <CoverImage
                  src={selected.coverUrl}
                  alt={selected.title}
                  className="w-10 h-14 rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-bark text-sm line-clamp-1">{selected.title}</p>
                {selected.author && (
                  <p className="text-xs text-bark-muted">{selected.author}</p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-bark-muted hover:text-bark underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-bark">Search by title</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-muted"
                    size={15}
                    strokeWidth={1.75}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
                    placeholder="e.g. The Long Earth"
                    className="w-full rounded-2xl border border-lace bg-cream pl-9 pr-4 py-2.5 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={search}
                  disabled={searching}
                  className="shrink-0 rounded-full bg-blush px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blush-dark disabled:opacity-50 cursor-pointer"
                >
                  {searching ? <Loader2 size={14} className="animate-spin" /> : "Search"}
                </button>
              </div>

              {results.length > 0 && (
                <div className="rounded-2xl border border-lace bg-cream overflow-hidden">
                  {results.map((vol) => {
                    const thumbUrl = vol.volumeInfo.imageLinks?.smallThumbnail
                      ?.replace("http://", "https://")
                      .replace("&edge=curl", "");
                    return (
                      <button
                        key={vol.id}
                        type="button"
                        onClick={() => selectBook(vol)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-lace/60 transition-colors border-b border-lace last:border-0 cursor-pointer"
                      >
                        {thumbUrl ? (
                          <CoverImage
                            src={thumbUrl}
                            alt=""
                            className="w-8 h-11 rounded shrink-0"
                            iconSize={14}
                          />
                        ) : (
                          <div className="w-8 h-11 rounded bg-lace flex items-center justify-center shrink-0">
                            <BookOpen size={14} className="text-bark-muted" strokeWidth={1.5} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-bark line-clamp-1">{vol.volumeInfo.title}</p>
                          {vol.volumeInfo.authors?.[0] && (
                            <p className="text-xs text-bark-muted">{vol.volumeInfo.authors[0]}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            {!selected && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-bark">
                  Or enter title manually
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Book title"
                  required
                  className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-bark">
                Total pages
                {selected?.totalPages && (
                  <span className="ml-1.5 text-xs font-normal text-bark-muted">
                    from Google Books
                  </span>
                )}
              </label>
              <input
                name="totalPages"
                type="number"
                min={1}
                key={selected?.volumeId}
                defaultValue={selected?.totalPages ?? ""}
                placeholder="e.g. 400"
                className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-bark">Suggested by</label>
              <select
                name="suggestedByUserId"
                defaultValue={currentUserId}
                className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {displayName(u)}{u.id === currentUserId ? " (you)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t border-lace">
              <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">Meeting</p>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-bark">
                  Date &amp; time <span className="text-blush">*</span>
                </label>
                <input
                  name="meetingDate"
                  type="datetime-local"
                  required
                  className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-bark">Location</label>
                <input
                  name="meetingLocation"
                  type="text"
                  placeholder="e.g. Sarah's place, Coffee Bean on Main…"
                  className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-bark">Activity</label>
                <input
                  name="meetingActivity"
                  type="text"
                  placeholder="e.g. painted pottery, jigsaw puzzle, nature walk…"
                  className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-bark">Notes</label>
                <textarea
                  name="meetingNotes"
                  rows={2}
                  placeholder="Anything to bring, activity ideas…"
                  className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-blush py-3 font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              {isPending ? "Adding…" : "Add to reading list"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
