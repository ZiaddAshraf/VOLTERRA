import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const variantSchema = z.object({ productId: z.string().min(1), color: z.string().trim().min(1).max(30), size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]), sku: z.string().trim().min(2).max(80), stock: z.number().int().min(0), price: z.number().positive() });

export async function GET() {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    return NextResponse.json(await prisma.productVariant.findMany({ include: { product: { select: { id: true, name: true } } }, orderBy: { sku: "asc" } }));
}

export async function POST(request: Request) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const parsed = variantSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid variant details." }, { status: 400 });
    try { return NextResponse.json(await prisma.productVariant.create({ data: parsed.data }), { status: 201 }); }
    catch { return NextResponse.json({ error: "SKU or color/size combination already exists." }, { status: 409 }); }
}
