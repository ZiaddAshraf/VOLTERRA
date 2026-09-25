import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({ name: z.string().trim().min(2).max(120).optional(), slug: z.string().trim().regex(/^[a-z0-9-]+$/).optional(), description: z.string().trim().min(10).optional(), price: z.number().positive().optional(), salePrice: z.number().positive().nullable().optional(), category: z.string().trim().min(2).optional(), compressionLevel: z.string().trim().min(2).optional(), fit: z.string().trim().min(2).optional(), compression: z.string().trim().min(2).optional(), material: z.string().trim().min(2).optional(), accent: z.string().trim().min(2).optional(), images: z.array(z.string().url()).max(12).optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    const parsed = updateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid product details." }, { status: 400 });
    const { images, ...data } = parsed.data;
    try {
        const product = await prisma.$transaction(async (transaction) => {
            if (images) await transaction.productImage.deleteMany({ where: { productId: id } });
            return transaction.product.update({ where: { id }, data: { ...data, ...(images ? { images: { create: images.map((url, sortOrder) => ({ url, sortOrder, alt: data.name })) } } : {}) }, include: { variants: true, images: true } });
        });
        return NextResponse.json(product);
    } catch {
        return NextResponse.json({ error: "Product not found or slug is already in use." }, { status: 404 });
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    try {
        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "This product cannot be deleted because it is referenced by an order." }, { status: 409 });
    }
}
