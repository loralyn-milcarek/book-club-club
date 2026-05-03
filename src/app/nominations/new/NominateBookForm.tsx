"use client";

import { useState, useTransition } from "react";
import { nominateBook } from "@/lib/actions";
import { BookOpen, Search, Loader2, ArrowLeft, Star } from "lucide-react";
import CoverImage from "@/components/CoverImage";
import Link from "next/link";

type OLDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
};

type SelectedBook = {
  title: string;
  author: string;
  coverUrl: string;
  openLibraryId: string;
  olDescription: string;
  olRating: number | null;
  olRatingCount: number | null;
};

function extractDescription(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "value" in raw) return String((raw as { value: unknown }).value);
  return "";
}

async function fetchOLMeta(key: string): Promise<{ description: string; rating: number | null; ratingCount: number | null }> {
  const [worksRes, ratingsRes] = await Promise.allSettled([
    fetch(`https://openlibrary.org${key}.json`),
    fetch(`https://openlibrary.org${key}/ratings.json`),
  ]);

  let description = "";
  let rating: number | null = null;
  let ratingCount: number | null = null;

  if (worksRes.status === "fulfilled" && worksRes.value.ok) {
    const data = await worksRes.value.json();
    description = extractDescription(data.description);
  }

  if (ratingsRes.status === "fulfilled" && ratingsRes.value.ok) {
    const data = await ratingsRes.value.json();
    const avg = data?.summary?.average;
    const count = data?.summary?.count;
    if (avg && count > 0) {
      rating = Math.round(avg * 10) / 10;
      ratingCount = count;
    }
  }

  return { description, rating, ratingCount };
}

export default function NominateBookForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OLDoc[]>([]);
  const [searching, setSearching] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [selected, setSelected] = useState<SelectedBook | null>(null);
  const [isPending, startTransition] = useTransition();

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=6&fields=key,title,author_name,cover_i`
      );
      const data = await res.json();
      setResults(data.docs ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function selectBook(doc: OLDoc) {
    setResults([]);
    setQuery("");
    setFetchingMeta(true);
    const { description, rating, ratingCount } = await fetchOLMeta(doc.key);
    setSelected({
      title: doc.title,
      author: doc.author_name?.[0] ?? "",
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : "",
      openLibraryId: doc.key,
      olDescription: description,
      olRating: rating,
      olRatingCount: ratingCount,
    });
    setFetchingMeta(false);
  }

  function handleSubmit(formData: FormData) {
    if (selected) {
      formData.set("title", selected.title);
      formData.set("author", selected.author);
      formData.set("coverUrl", selected.coverUrl);
      formData.set("openLibraryId", selected.openLibraryId);
      formData.set("olDescription", selected.olDescription);
      if (selected.olRating !== null) formData.set("olRating", String(selected.olRating));
      if (selected.olRatingCount !== null) formData.set("olRatingCount", String(selected.olRatingCount));
    }
    startTransition(() => nominateBook(formData));
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/nominations"
            className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
          <h1 className="font-display text-2xl font-bold text-bark">Nominate a book</h1>
        </div>

        <div
          className="bg-parchment rounded-3xl p-6 border border-lace space-y-5"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          {fetchingMeta ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-lace/60">
              <Loader2 size={16} className="animate-spin text-bark-muted" />
              <p className="text-sm text-bark-muted">Fetching book info…</p>
            </div>
          ) : selected ? (
            <div className="space-y-3">
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
                  {selected.olRating !== null && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="fill-bark-muted text-bark-muted" />
                      <span className="text-xs text-bark-muted">
                        {selected.olRating} · {selected.olRatingCount?.toLocaleString()} ratings
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-bark-muted hover:text-bark underline underline-offset-2 shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>

              {selected.olDescription && (
                <div className="rounded-2xl bg-cream border border-lace px-4 py-3">
                  <p className="text-xs font-medium text-bark-muted mb-1">From Open Library</p>
                  <p className="text-xs text-bark/80 leading-relaxed line-clamp-4">
                    {selected.olDescription}
                  </p>
                </div>
              )}
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
                    placeholder="e.g. Piranesi"
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
                  {results.map((doc) => (
                    <button
                      key={doc.key}
                      type="button"
                      onClick={() => selectBook(doc)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-lace/60 transition-colors border-b border-lace last:border-0 cursor-pointer"
                    >
                      {doc.cover_i ? (
                        <CoverImage
                          src={`https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`}
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
                        <p className="text-sm font-medium text-bark line-clamp-1">{doc.title}</p>
                        {doc.author_name?.[0] && (
                          <p className="text-xs text-bark-muted">{doc.author_name[0]}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            {!selected && !fetchingMeta && (
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
                Why should we read this? <span className="text-blush">*</span>
              </label>
              <textarea
                name="blurb"
                rows={4}
                required
                placeholder="Give us your pitch — what makes this book special?"
                className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || fetchingMeta}
              className="w-full rounded-full bg-blush py-3 font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              {isPending ? "Submitting…" : "Submit nomination"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
