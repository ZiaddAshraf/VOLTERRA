import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const variantSchema = z.object({ color: z.string().trim().min(1).max(30).optional(), size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]).optional(), sku: z.string().trim().min(2).max(80).optional(), stock: z.number().int().min(0).optional(), price: z.number().positive().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    const parsed = variantSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid variant details." }, { status: 400 });
    try { return NextResponse.json(await prisma.productVariant.update({ where: { id }, data: parsed.data })); }
    catch { return NextResponse.json({ error: "Variant not found or duplicate SKU/combination." }, { status: 409 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    try { await prisma.productVariant.delete({ where: { id } }); return NextResponse.json({ success: true }); }
    catch { return NextResponse.json({ error: "Variant cannot be deleted because it is referenced by an order or cart." }, { status: 409 }); }
}
