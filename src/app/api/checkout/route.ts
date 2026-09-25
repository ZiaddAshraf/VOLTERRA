import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { calculateDiscount, checkoutSchema } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function money(value: number) {
    return Math.round(value * 100) / 100;
}

export async function POST(request: Request) {
    const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please check your checkout details." }, { status: 400 });

    const session = await getServerSession(authOptions);
    const data = parsed.data;
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { variants: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    const resolvedItems = data.items.map((item) => {
        const product = productsById.get(item.productId);
        const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
        return { item, product, variant };
    });

    if (resolvedItems.some(({ product, variant }) => !product || !variant)) {
        return NextResponse.json({ error: "One or more selected shirt variants are no longer available." }, { status: 409 });
    }

    const subtotal = money(resolvedItems.reduce((sum, { item, variant }) => sum + Number(variant!.price) * item.quantity, 0));
    let discount = 0;
    let couponId: string | undefined;

    if (data.couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
        const valid = coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
            (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) && subtotal >= Number(coupon.minimumOrder);
        if (!valid) return NextResponse.json({ error: "This coupon is invalid or cannot be used for this order." }, { status: 400 });
        discount = money(calculateDiscount(coupon.type, Number(coupon.value), subtotal));
        couponId = coupon.id;
    }

    const shipping = subtotal - discount >= 75 ? 0 : 12;
    const total = money(subtotal + shipping - discount);
    const orderNumber = `VLT-${Date.now().toString(36).toUpperCase()}`;
    const guestLookupToken = randomBytes(32).toString("hex");
    const guestLookupTokenHash = createHash("sha256").update(guestLookupToken).digest("hex");
    const guestLookupExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    if (!stripe) {
        return NextResponse.json({ error: "Payments are not configured. Add Stripe test keys before accepting orders." }, { status: 503 });
    }

    try {
        const order = await prisma.$transaction(async (transaction) => {
            for (const { item, variant } of resolvedItems) {
                const reserved = await transaction.productVariant.updateMany({
                    where: { id: variant!.id, stock: { gte: item.quantity } },
                    data: { stock: { decrement: item.quantity } },
                });
                if (reserved.count !== 1) throw new Error("INSUFFICIENT_STOCK");
            }

            const createdOrder = await transaction.order.create({
                data: {
                    orderNumber,
                    userId: session?.user?.id,
                    guestLookupTokenHash,
                    guestLookupExpiresAt,
                    email: data.email.toLowerCase(),
                    phone: data.phone || null,
                    fullName: data.fullName,
                    address: data.address,
                    city: data.city,
                    country: data.country,
                    postalCode: data.postalCode,
                    subtotal,
                    shipping,
                    discount,
                    total,
                    items: {
                        create: resolvedItems.map(({ item, product, variant }) => ({
                            productId: product!.id,
                            variantId: variant!.id,
                            name: product!.name,
                            sku: variant!.sku,
                            color: variant!.color,
                            size: variant!.size,
                            quantity: item.quantity,
                            unitPrice: variant!.price,
                        })),
                    },
                },
                include: { items: true },
            });

            if (couponId) {
                const currentCoupon = await transaction.coupon.findUnique({ where: { id: couponId } });
                if (!currentCoupon || !currentCoupon.active || (currentCoupon.usageLimit !== null && currentCoupon.usedCount >= currentCoupon.usageLimit)) {
                    throw new Error("COUPON_UNAVAILABLE");
                }
                const couponUsage = await transaction.coupon.updateMany({
                    where: { id: couponId, usedCount: currentCoupon.usedCount },
                    data: { usedCount: { increment: 1 } },
                });
                if (couponUsage.count !== 1) throw new Error("COUPON_UNAVAILABLE");
            }

            return createdOrder;
        });

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: data.email,
            line_items: order.items.map((item) => ({
                quantity: item.quantity,
                price_data: {
                    currency: "usd",
                    product_data: { name: item.name, metadata: { sku: item.sku, size: item.size, color: item.color } },
                    unit_amount: Math.round(Number(item.unitPrice) * 100),
                },
            })),
            metadata: { orderId: order.id },
            success_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/checkout/success?token=${guestLookupToken}`,
            cancel_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/checkout?cancelled=1`,
        });

        await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkoutSession.id } });
        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        const pendingOrder = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
        if (pendingOrder?.paymentStatus === "PENDING") {
            await prisma.$transaction(async (transaction) => {
                for (const item of pendingOrder.items) {
                    if (item.variantId) {
                        await transaction.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
                    }
                }
                await transaction.order.update({ where: { id: pendingOrder.id }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
                if (couponId) {
                    await transaction.coupon.updateMany({ where: { id: couponId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
                }
            });
        }
        const message = error instanceof Error && error.message === "INSUFFICIENT_STOCK"
            ? "One or more selected variants do not have enough stock."
            : "We could not create your order. Please try again.";
        return NextResponse.json({ error: message }, { status: message.includes("stock") ? 409 : 500 });
    }
}
