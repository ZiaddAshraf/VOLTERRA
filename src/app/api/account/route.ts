import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().max(30).optional(),
});

export async function GET() {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const account = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, phone: true, addresses: true },
    });
    return NextResponse.json(account);
}

export async function PATCH(request: Request) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const parsed = profileSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please provide valid profile details." }, { status: 400 });
    const account = await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name, phone: parsed.data.phone || null }, select: { id: true, name: true, email: true, phone: true } });
    return NextResponse.json(account);
}
