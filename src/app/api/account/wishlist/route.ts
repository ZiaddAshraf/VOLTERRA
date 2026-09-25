import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const itemSchema = z.object({ productId: z.string().min(1) });

export async function GET() {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id }, include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } } } } });
    return NextResponse.json(wishlist?.items ?? []);
}

export async function POST(request: Request) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const parsed = itemSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const wishlist = await prisma.wishlist.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
    const item = await prisma.wishlistItem.upsert({ where: { wishlistId_productId: { wishlistId: wishlist.id, productId: product.id } }, create: { wishlistId: wishlist.id, productId: product.id }, update: {} });
    return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request: Request) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const parsed = itemSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (wishlist) await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId: parsed.data.productId } });
    return NextResponse.json({ success: true });
}
