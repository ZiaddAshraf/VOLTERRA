import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
    fullName: z.string().trim().min(2).max(100),
    address: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(2).max(20),
    isDefault: z.boolean().default(false),
});

export async function GET() {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return NextResponse.json(await prisma.address.findMany({ where: { userId: user.id }, orderBy: { id: "desc" } }));
}

export async function POST(request: Request) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const parsed = addressSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please provide a valid address." }, { status: 400 });
    const address = await prisma.$transaction(async (transaction) => {
        if (parsed.data.isDefault) await transaction.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
        return transaction.address.create({ data: { ...parsed.data, userId: user.id } });
    });
    return NextResponse.json(address, { status: 201 });
}
