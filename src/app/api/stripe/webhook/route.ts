import Stripe from "stripe";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const secret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !webhookSecret) return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });

    const stripe = new Stripe(secret);
    const signature = request.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
    } catch {
        return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_failed" && event.type !== "checkout.session.expired") {
        return NextResponse.json({ received: true });
    }

    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;
    if (!orderId) return NextResponse.json({ error: "Webhook order metadata is missing." }, { status: 400 });

    await prisma.$transaction(async (transaction) => {
        const order = await transaction.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order) return;

        if (event.type === "checkout.session.completed") {
            if (order.paymentStatus === "PAID") return;
            await transaction.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "PAID" } });
            return;
        }

        if (order.paymentStatus !== "PENDING") return;
        for (const item of order.items) {
            if (item.variantId) {
                await transaction.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
            }
        }
        await transaction.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
    });

    return NextResponse.json({ received: true });
}
