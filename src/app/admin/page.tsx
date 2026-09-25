import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AdminPanel } from "@/components/admin/admin-panel";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");
    if (session.user.role !== "ADMIN") return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Forbidden</h1><p className="mt-4 text-zinc-600">This area is reserved for admin access only.</p></div>;
    const [revenue, orders, customers, products, lowStock] = await Promise.all([
        prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
        prisma.order.count(),
        prisma.user.count({ where: { role: "USER" } }),
        prisma.product.count(),
        prisma.productVariant.count({ where: { stock: { lt: 5 } } }),
    ]);
    const metrics = [{ label: "Total Revenue", value: `$${Number(revenue._sum.total ?? 0).toFixed(2)}` }, { label: "Orders", value: String(orders) }, { label: "Customers", value: String(customers) }, { label: "Products", value: String(products) }, { label: "Low Stock", value: String(lowStock) }];
    return <div className="mx-auto max-w-7xl px-4 py-10 md:px-6"><h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Admin dashboard</h1><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">{metrics.map((metric) => <div key={metric.label} className="rounded-[26px] border border-black/5 bg-white p-5 shadow-sm"><div className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">{metric.label}</div><div className="mt-4 text-3xl font-black tracking-[-0.06em]">{metric.value}</div></div>)}</div><AdminPanel /></div>;
}
