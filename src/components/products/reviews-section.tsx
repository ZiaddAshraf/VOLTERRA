"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Review = { id: string; rating: number; title: string; comment: string; createdAt: string; user: { name: string } };

export function ReviewsSection({ productSlug }: { productSlug: string }) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [average, setAverage] = useState(0);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    useEffect(() => { fetch(`/api/products/${productSlug}/reviews`).then((response) => response.json()).then((data) => { setReviews(data.reviews); setAverage(data.average); }).catch(() => setError("Reviews are unavailable right now.")); }, [productSlug]);
    async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(""); setMessage(""); const form = new FormData(event.currentTarget); const response = await fetch(`/api/products/${productSlug}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: Number(form.get("rating")), title: form.get("title"), comment: form.get("comment") }) }); const result = await response.json().catch(() => null); if (!response.ok) setError(result?.error ?? "Review could not be submitted."); else { setMessage("Review submitted."); event.currentTarget.reset(); const refresh = await fetch(`/api/products/${productSlug}/reviews`); const data = await refresh.json(); setReviews(data.reviews); setAverage(data.average); } setSaving(false); }
    return <section className="mt-12 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Reviews</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.06em]">{average.toFixed(1)} / 5</h2></div><span className="text-sm text-zinc-600">{reviews.length} verified reviews</span></div>{error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{message && <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p>}<div className="mt-6 space-y-4">{reviews.map((review) => <article key={review.id} className="border-t border-black/5 pt-4"><div className="flex justify-between gap-4"><div className="font-semibold">{review.title}</div><div className="text-[#d8452a]">{"★".repeat(review.rating)}</div></div><p className="mt-2 text-sm leading-6 text-zinc-700">{review.comment}</p><p className="mt-2 text-xs text-zinc-500">{review.user.name} · Verified purchase · {new Date(review.createdAt).toLocaleDateString()}</p></article>)}</div>{session && <form onSubmit={submit} className="mt-8 border-t border-black/5 pt-6"><h3 className="text-sm font-semibold uppercase tracking-[0.18em]">Share your experience</h3><div className="mt-4 grid gap-3 md:grid-cols-2"><select name="rating" defaultValue="5" className="rounded-full border border-black/10 px-4 py-3 text-sm"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><Input name="title" placeholder="Review title" required /><textarea name="comment" placeholder="Tell us about the fit and performance" required minLength={10} className="min-h-28 rounded-2xl border border-black/10 p-4 text-sm md:col-span-2" /><Button disabled={saving}>{saving ? "Submitting..." : "Submit review"}</Button></div></form>}</section>;
}
