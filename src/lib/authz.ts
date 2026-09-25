import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";

export async function requireUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    return session.user;
}

export async function requireUserResponse() {
    const user = await requireUser();
    return user ?? NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

export async function requireAdminResponse() {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    return user;
}
