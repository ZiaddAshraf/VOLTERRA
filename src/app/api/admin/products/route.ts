import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
    name: z.string().trim().min(2).max(120), slug: z.string().trim().regex(/^[a-z0-9-]+$/), category: z.string().trim().min(2).max(100),
    description: z.string().trim().min(10), fit: z.string().trim().min(2), compression: z.string().trim().min(2), material: z.string().trim().min(2), accent: z.string().trim().min(2),
    price: z.number().positive(), salePrice: z.number().positive().nullable().optional(), compressionLevel: z.string().trim().min(2), images: z.array(z.string().url()).max(12).default([]),
});

export async function GET() {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    return NextResponse.json(await prisma.product.findMany({ include: { variants: true, images: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const parsed = productSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid product details." }, { status: 400 });
    const { images, ...data } = parsed.data;
    try {
        const product = await prisma.product.create({ data: { ...data, images: { create: images.map((url, sortOrder) => ({ url, sortOrder, alt: data.name })) } }, include: { variants: true, images: true } });
        return NextResponse.json(product, { status: 201 });
    } catch {
        return NextResponse.json({ error: "A product with that slug may already exist." }, { status: 409 });
    }
}
