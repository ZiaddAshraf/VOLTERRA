import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({ fullName: z.string().trim().min(2).max(100).optional(), address: z.string().trim().min(3).max(200).optional(), city: z.string().trim().min(2).max(100).optional(), country: z.string().trim().min(2).max(100).optional(), postalCode: z.string().trim().min(2).max(20).optional(), isDefault: z.boolean().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { id } = await params;
    const parsed = addressSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid address." }, { status: 400 });
    const owned = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!owned) return NextResponse.json({ error: "Address not found." }, { status: 404 });
    const address = await prisma.$transaction(async (transaction) => {
        if (parsed.data.isDefault) await transaction.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
        return transaction.address.update({ where: { id }, data: parsed.data });
    });
    return NextResponse.json(address);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { id } = await params;
    const deleted = await prisma.address.deleteMany({ where: { id, userId: user.id } });
    if (!deleted.count) return NextResponse.json({ error: "Address not found." }, { status: 404 });
    return NextResponse.json({ success: true });
}
