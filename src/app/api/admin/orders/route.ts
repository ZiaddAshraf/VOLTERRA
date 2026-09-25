import { NextResponse } from "next/server";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    return NextResponse.json(await prisma.order.findMany({ include: { user: { select: { id: true, name: true, email: true } }, items: true }, orderBy: { createdAt: "desc" } }));
}
