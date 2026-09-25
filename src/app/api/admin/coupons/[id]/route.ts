import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const couponSchema = z.object({ code: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()).optional(), type: z.enum(["PERCENTAGE", "FIXED"]).optional(), value: z.number().positive().optional(), minimumOrder: z.number().min(0).optional(), expiresAt: z.string().datetime().nullable().optional(), usageLimit: z.number().int().positive().nullable().optional(), active: z.boolean().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    const parsed = couponSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid coupon details." }, { status: 400 });
    const { expiresAt, ...data } = parsed.data;
    try { return NextResponse.json(await prisma.coupon.update({ where: { id }, data: { ...data, ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}) } })); }
    catch { return NextResponse.json({ error: "Coupon not found or code is already in use." }, { status: 409 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    try { await prisma.coupon.delete({ where: { id } }); return NextResponse.json({ success: true }); }
    catch { return NextResponse.json({ error: "Coupon not found." }, { status: 404 }); }
}
