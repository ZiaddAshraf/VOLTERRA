import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const cartItemSchema = z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) });

async function getCart(userId: string) {
    return prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } }, variant: true } } } });
}

export async function GET() {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return NextResponse.json((await getCart(user.id))?.items ?? []);
}

export async function PUT(request: Request) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const parsed = cartItemSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
    const variant = await prisma.productVariant.findUnique({ where: { id: parsed.data.variantId } });
    if (!variant) return NextResponse.json({ error: "Variant not found." }, { status: 404 });
    const cart = await prisma.cart.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
    const item = await prisma.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } }, create: { cartId: cart.id, productId: variant.productId, variantId: variant.id, color: variant.color, size: variant.size, quantity: parsed.data.quantity }, update: { quantity: parsed.data.quantity, color: variant.color, size: variant.size, productId: variant.productId } });
    return NextResponse.json(item);
}

export async function DELETE(request: Request) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const parsed = z.object({ variantId: z.string().min(1) }).safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId: parsed.data.variantId } });
    return NextResponse.json({ success: true });
}
