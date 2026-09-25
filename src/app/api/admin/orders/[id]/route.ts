import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({ status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]) });

const transitions: Record<string, string[]> = { PENDING: ["PAID", "CANCELLED"], PAID: ["PROCESSING", "CANCELLED"], PROCESSING: ["SHIPPED"], SHIPPED: ["DELIVERED"], DELIVERED: [], CANCELLED: [] };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    const parsed = statusSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (!transitions[order.status].includes(parsed.data.status)) return NextResponse.json({ error: "That order status transition is not allowed." }, { status: 409 });
    return NextResponse.json(await prisma.order.update({ where: { id }, data: { status: parsed.data.status } }));
}
