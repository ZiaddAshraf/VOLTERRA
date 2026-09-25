import { NextResponse } from "next/server";

import { requireAdminResponse } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const admin = await requireAdminResponse();
    if (admin instanceof NextResponse) return admin;
    const customers = await prisma.user.findMany({ where: { role: "USER" }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { orders: true } }, orders: { where: { paymentStatus: "PAID" }, select: { total: true } } } });
    return NextResponse.json(customers.map((customer) => ({ ...customer, totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.total), 0), orders: undefined })));
}