import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");
    const { id } = await params;
    const order = await prisma.order.findFirst({ where: { id, userId: session.user.id }, include: { items: true } });
    if (!order) notFound();
    return <div className="mx-auto max-w-5xl px-4 py-10 md:px-6"><Link href="/account" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8452a]">Back to account</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Order</p><h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em]">#{order.orderNumber}</h1></div><div className="text-right text-sm text-zinc-600"><div>{order.status} / {order.paymentStatus}</div><div>{order.createdAt.toLocaleDateString()}</div></div></div><div className="mt-8 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><div className="space-y-4">{order.items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4 text-sm"><div><div className="font-semibold">{item.name}</div><div className="text-zinc-500">{item.color} / {item.size} / {item.sku}</div></div><div>{item.quantity} × ${Number(item.unitPrice).toFixed(2)}</div><div className="font-semibold">${(Number(item.unitPrice) * item.quantity).toFixed(2)}</div></div>)}</div><div className="mt-6 flex justify-between text-lg font-bold"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div><div className="mt-5 text-sm text-zinc-600">Shipping to {order.fullName}, {order.address}, {order.city}, {order.country} {order.postalCode}</div></div></div>;
}
