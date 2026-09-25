import { NextResponse } from "next/server";

import { catalogInclude, toProductViewModel } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const query = new URL(request.url).searchParams.get("q")?.trim();
    const category = new URL(request.url).searchParams.get("category");
    const products = await prisma.product.findMany({ where: { ...(category ? { category } : {}), ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { category: { contains: query, mode: "insensitive" } }] } : {}) }, include: catalogInclude, orderBy: { createdAt: "desc" } });
    return NextResponse.json(products.map(toProductViewModel));
}
