import { NextResponse } from "next/server";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, orderNumber: true, createdAt: true, status: true, paymentStatus: true, total: true, _count: { select: { items: true } } },
    });
    return NextResponse.json(orders);
}
