import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const token = new URL(request.url).searchParams.get("token")?.trim();
    if (!token || token.length !== 64) return NextResponse.json({ error: "Enter a valid order lookup token." }, { status: 400 });
    const order = await prisma.order.findFirst({ where: { guestLookupTokenHash: createHash("sha256").update(token).digest("hex"), guestLookupExpiresAt: { gt: new Date() } }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found or lookup token expired." }, { status: 404 });
    return NextResponse.json({ orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, total: order.total, email: order.email, fullName: order.fullName, address: order.address, city: order.city, country: order.country, postalCode: order.postalCode, items: order.items.map((item) => ({ name: item.name, sku: item.sku, size: item.size, color: item.color, quantity: item.quantity, unitPrice: item.unitPrice })) });
}
