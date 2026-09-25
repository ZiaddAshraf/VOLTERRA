"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LookupOrder = { orderNumber: string; status: string; paymentStatus: string; total: string | number; fullName: string; address: string; city: string; country: string; postalCode: string; items: { name: string; sku: string; size: string; color: string; quantity: number; unitPrice: string | number }[] };

export default function GuestOrderLookupPage() {
    const [token, setToken] = useState("");
    const [order, setOrder] = useState<LookupOrder | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    async function lookup(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); setOrder(null); const response = await fetch(`/api/orders/lookup?token=${encodeURIComponent(token)}`); const result = await response.json(); if (!response.ok) setError(result.error); else setOrder(result); setLoading(false); }
    return <div className="mx-auto max-w-3xl px-6 py-16"><p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Guest orders</p><h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.08em]">Find your order</h1><p className="mt-4 text-zinc-600">Enter the secure lookup token from your order confirmation.</p><form onSubmit={lookup} className="mt-8 flex gap-3"><Input value={token} onChange={(event) => setToken(event.target.value)} placeholder="64-character lookup token" required minLength={64} maxLength={64} /><Button disabled={loading}>{loading ? "Looking up..." : "Lookup"}</Button></form>{error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{order && <section className="mt-8 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl font-black">#{order.orderNumber}</h2><span>{order.status} / {order.paymentStatus}</span></div><div className="mt-6 space-y-3">{order.items.map((item) => <div key={item.sku} className="flex justify-between border-t border-black/5 pt-3 text-sm"><span>{item.name} · {item.color} / {item.size} · {item.sku}</span><span>{item.quantity} × ${Number(item.unitPrice).toFixed(2)}</span></div>)}</div><div className="mt-6 flex justify-between border-t border-black/5 pt-5 font-bold"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div><p className="mt-4 text-sm text-zinc-600">Shipping to {order.fullName}, {order.address}, {order.city}, {order.country} {order.postalCode}</p></section>}</div>;
}
