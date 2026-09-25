import { NextResponse } from "next/server";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { id } = await params;
    const order = await prisma.order.findFirst({
        where: { id, userId: user.id },
        include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json(order);
}
