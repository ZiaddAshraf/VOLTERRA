import { NextResponse } from "next/server";

import { catalogInclude, toProductViewModel } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await prisma.product.findUnique({ where: { slug }, include: catalogInclude });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json(toProductViewModel(product));
}
