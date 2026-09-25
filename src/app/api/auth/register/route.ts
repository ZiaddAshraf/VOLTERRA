import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
    phone: z.string().trim().max(30).optional(),
});

export async function POST(request: Request) {
    const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please provide valid account details." }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existingUser) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
        data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null, passwordHash },
        select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user }, { status: 201 });
}
