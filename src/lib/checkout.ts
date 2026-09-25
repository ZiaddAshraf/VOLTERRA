import { z } from "zod";

export const checkoutSchema = z.object({
    email: z.string().email(),
    phone: z.string().trim().max(30).optional(),
    fullName: z.string().trim().min(2).max(100),
    address: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(2).max(20),
    couponCode: z.string().trim().max(40).optional(),
    items: z.array(z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        color: z.string().min(1),
        size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
        quantity: z.number().int().min(1).max(20),
    })).min(1).max(100),
});

export function calculateDiscount(type: string, value: number, subtotal: number) {
    if (type === "PERCENTAGE") return Math.min(subtotal, subtotal * (value / 100));
    return Math.min(subtotal, value);
}
