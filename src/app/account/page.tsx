"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Account = { name: string; email: string; phone: string | null };
type Order = { id: string; orderNumber: string; createdAt: string; status: string; paymentStatus: string; total: string | number; _count: { items: number } };

export default function AccountPage() {
    const { data: session, status } = useSession();
    const [account, setAccount] = useState<Account | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") return;
        Promise.all([fetch("/api/account"), fetch("/api/account/orders")]).then(async ([accountResponse, ordersResponse]) => {
            if (!accountResponse.ok || !ordersResponse.ok) throw new Error("Unable to load account.");
            setAccount(await accountResponse.json());
            setOrders(await ordersResponse.json());
        }).catch(() => setError("We could not load your account right now."));
    }, [status]);

    if (status === "loading") return <div className="mx-auto max-w-3xl px-6 py-20 text-center">Loading account...</div>;
    if (!session) return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Sign in to access your account.</h1><p className="mt-4 text-zinc-600">Track orders, manage wishlist items, and review products you&apos;ve purchased.</p><Link href="/login" className="mt-8 inline-flex rounded-full bg-[#d8452a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">Login</Link></div>;

    async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true); setMessage(""); setError("");
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), phone: form.get("phone") }) });
        const result = await response.json().catch(() => null);
        if (!response.ok) setError(result?.error ?? "We could not update your profile.");
        else { setAccount((current) => current ? { ...current, ...result } : result); setMessage("Profile updated."); }
        setSaving(false);
    }

    return <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4"><div><div className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">Account</div><h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em]">Welcome, {account?.name ?? session.user?.name}</h1></div><Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>Logout</Button></div>
        {error && <p className="mb-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{message && <p className="mb-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p>}
        <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Profile</h2><form onSubmit={saveProfile} className="mt-5 space-y-4"><Input name="name" defaultValue={account?.name ?? ""} placeholder="Name" required /><Input value={account?.email ?? session.user?.email ?? ""} disabled /><Input name="phone" defaultValue={account?.phone ?? ""} placeholder="Phone" /><Button disabled={saving} className="w-full">{saving ? "Saving..." : "Save profile"}</Button></form></section>
            <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm lg:col-span-2"><h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Orders</h2>{orders.length === 0 ? <p className="mt-5 text-zinc-600">You haven&apos;t placed an order yet.</p> : <div className="mt-5 space-y-3">{orders.map((order) => <Link key={order.id} href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-[#f8f7f6] px-4 py-3 text-sm"><span className="font-semibold">#{order.orderNumber}</span><span>{new Date(order.createdAt).toLocaleDateString()}</span><span>{order._count.items} items</span><span>{order.status} / {order.paymentStatus}</span><span>${Number(order.total).toFixed(2)}</span></Link>)}</div>}</section>
        </div>
    </div>;
}
