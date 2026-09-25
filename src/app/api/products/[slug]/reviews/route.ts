import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({ rating: z.number().int().min(1).max(5), title: z.string().trim().min(2).max(120), comment: z.string().trim().min(10).max(2000) });

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const reviews = await prisma.review.findMany({ where: { productId: slug }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
    const distribution = [5, 4, 3, 2, 1].map((rating) => ({ rating, count: reviews.filter((review) => review.rating === rating).length }));
    return NextResponse.json({ reviews, distribution, average: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0 });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { slug } = await params;
    const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please provide a valid review." }, { status: 400 });
    const purchased = await prisma.orderItem.findFirst({ where: { productId: slug, order: { userId: user.id, paymentStatus: "PAID" } } });
    if (!purchased) return NextResponse.json({ error: "Only verified purchasers can review this shirt." }, { status: 403 });
    try {
        const review = await prisma.review.create({ data: { ...parsed.data, productId: slug, userId: user.id } });
        return NextResponse.json(review, { status: 201 });
    } catch { return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 }); }
}
