"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useStore } from "@/components/providers/store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CartPage() {
    const { cart, updateCartItem, removeFromCart } = useStore();

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 75 ? 0 : 12;
    const discount = subtotal > 150 ? 15 : 0;
    const total = subtotal + shipping - discount;

    if (cart.length === 0) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-16 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d8452a]/10 text-[#d8452a]">
                    <ShoppingBag className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Your cart is empty.</h1>
                <p className="mt-4 text-zinc-600">Add a few premium compression shirts and get ready to train harder.</p>
                <Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#d8452a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    Continue shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
            <h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Cart</h1>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-5">
                    {cart.map((item) => (
                        <div key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-black/5 bg-white p-4 shadow-sm md:flex-row md:items-center">
                            <Image src={item.image} alt={item.name} width={112} height={112} className="h-28 w-28 rounded-[22px] object-cover" />
                            <div className="flex-1">
                                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">{item.color} / {item.size}</div>
                                <Link href={`/products/${item.slug}`} className="mt-2 block text-2xl font-semibold tracking-[-0.04em]">{item.name}</Link>
                                <div className="mt-2 text-lg font-bold">${item.price}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center rounded-full border border-black/10 bg-[#f8f7f6]">
                                    <button type="button" onClick={() => updateCartItem(item.id, item.quantity - 1)} className="p-2.5 text-zinc-700">
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                    <button type="button" onClick={() => updateCartItem(item.id, item.quantity + 1)} className="p-2.5 text-zinc-700">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <button type="button" onClick={() => removeFromCart(item.id)} className="rounded-full border border-black/10 bg-white p-3 text-zinc-700">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <aside className="h-fit rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black uppercase tracking-[-0.04em]">Order summary</h2>
                    <div className="mt-6 space-y-3 text-sm text-zinc-700">
                        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
                        <div className="flex justify-between"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>
                    </div>
                    <div className="mt-5 flex gap-2">
                        <Input placeholder="Coupon code" className="h-11" />
                        <Button size="sm" variant="secondary">Apply</Button>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-5 text-lg font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="mt-6 space-y-3">
                        <Link href="/checkout" className="flex h-12 items-center justify-center rounded-full bg-[#d8452a] px-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                            Checkout
                        </Link>
                        <Link href="/shop" className="flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700">
                            Continue shopping
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}
