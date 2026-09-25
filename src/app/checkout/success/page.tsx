import Link from "next/link";
import { createHash } from "node:crypto";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const { token } = await searchParams;
    const session = await getServerSession(authOptions);
    const order = token ? await prisma.order.findFirst({
        where: session?.user?.id ? { guestLookupTokenHash: createHash("sha256").update(token).digest("hex"), userId: session.user.id, guestLookupExpiresAt: { gt: new Date() } } : { guestLookupTokenHash: createHash("sha256").update(token).digest("hex"), guestLookupExpiresAt: { gt: new Date() } },
        select: { orderNumber: true, total: true, paymentStatus: true },
    }) : null;

    return (
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">Order complete</p>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-[-0.08em]">Thank you for your order.</h1>
            <p className="mt-4 text-zinc-600">Your payment is being confirmed. We&apos;ll email your receipt when Stripe confirms the order.</p>
            {order && <div className="mt-8 rounded-[28px] border border-black/5 bg-white p-6 text-left shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                    <div><div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Order number</div><div className="mt-2 text-2xl font-bold">{order.orderNumber}</div></div>
                    <div><div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Payment</div><div className="mt-2 text-2xl font-bold">{order.paymentStatus}</div></div>
                    <div><div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total</div><div className="mt-2 text-2xl font-bold">${Number(order.total).toFixed(2)}</div></div>
                </div>
            </div>}
            <Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#d8452a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Continue shopping
            </Link>
        </div>
    );
}
