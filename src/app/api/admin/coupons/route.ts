import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const couponSchema = z.object({ code: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()), type: z.enum(["PERCENTAGE", "FIXED"]), value: z.number().positive(), minimumOrder: z.number().min(0).default(0), expiresAt: z.string().datetime().nullable().optional(), usageLimit: z.number().int().positive().nullable().optional(), active: z.boolean().default(true) });

export async function GET() {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    return NextResponse.json(await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const parsed = couponSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid coupon details." }, { status: 400 });
    try { return NextResponse.json(await prisma.coupon.create({ data: { ...parsed.data, expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null } }), { status: 201 }); }
    catch { return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 }); }
}
