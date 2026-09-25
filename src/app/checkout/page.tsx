"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useStore } from "@/components/providers/store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
    const { cart } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 75 ? 0 : 12;
    const total = subtotal + shipping;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: String(form.get("email")),
                phone: String(form.get("phone") || ""),
                fullName: String(form.get("fullName")),
                address: String(form.get("address")),
                city: String(form.get("city")),
                country: String(form.get("country")),
                postalCode: String(form.get("postalCode")),
                couponCode: String(form.get("couponCode") || ""),
                items: cart,
            }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.url) {
            setError(result?.error ?? "We could not start checkout. Please try again.");
            setIsSubmitting(false);
            return;
        }
        window.location.assign(result.url);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
            <h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Checkout</h1>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <form onSubmit={handleSubmit} className="space-y-8 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Contact</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Email</label>
                                <Input name="email" type="email" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Phone</label>
                                <Input name="phone" type="tel" required />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Shipping</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Full name</label>
                                <Input name="fullName" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Address</label>
                                <Input name="address" required />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">City</label>
                                <Input name="city" required />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Country</label>
                                <Input name="country" required />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Postal code</label>
                                <Input name="postalCode" required />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Payment</h2>
                        <div className="mt-4 rounded-2xl border border-black/5 bg-[#f8f7f6] p-4 text-sm text-zinc-700">
                            Demo mode active: Stripe test keys are not configured, so the purchase is simulated securely in development.
                        </div>
                    </div>

                    {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
                    <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Securely preparing checkout..." : "Continue to payment"}</Button>
                </form>

                <aside className="h-fit rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black uppercase tracking-[-0.04em]">Order summary</h2>
                    <div className="mt-5 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-[#f8f7f6] p-3">
                                <Image src={item.image} alt={item.name} width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
                                <div className="flex-1">
                                    <div className="font-semibold">{item.name}</div>
                                    <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">{item.color} / {item.size}</div>
                                </div>
                                <div className="text-sm font-semibold">${item.price}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 space-y-3 text-sm text-zinc-700">
                        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
                        <div className="flex justify-between"><span>Total</span><span>${total.toFixed(2)}</span></div>
                    </div>
                    <Link href="/cart" className="mt-6 inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[#d8452a]">
                        Return to cart
                    </Link>
                </aside>
            </div>
        </div>
    );
}
