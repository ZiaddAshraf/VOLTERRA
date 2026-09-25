"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";

import { useStore } from "@/components/providers/store-provider";
import type { Product } from "@/lib/types";

export function ProductCard({ product, dark = false }: { product: Product; dark?: boolean }) {
    const { addToCart, toggleWishlist, isWishlisted } = useStore();
    const hasSale = Boolean(product.salePrice && product.salePrice < product.price);

    return (
        <article
            className={`group overflow-hidden rounded-md border shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.38)] ${dark ? "border-[rgba(232,225,213,0.1)] bg-[#211F1C] text-[#E8E1D5]" : "border-[rgba(232,225,213,0.1)] bg-[#211F1C] text-[#E8E1D5]"
                }`}
        >
            <div className="relative">
                <Link href={`/products/${product.slug}`}>
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={1200}
                        height={900}
                        className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </Link>
                <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`absolute right-3 top-3 rounded-md p-2.5 backdrop-blur-sm transition duration-300 ${dark ? "bg-[#171614]/80 text-[#e8e1d5] hover:bg-[#2a2723]" : "bg-[#171614]/80 text-[#e8e1d5] hover:bg-[#2a2723]"
                        }`}
                    aria-label="Wishlist"
                >
                    <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current text-[#d8452a]" : ""}`} />
                </button>
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9c958b]">{product.category}</div>
                    <div className="flex items-center gap-1 text-[#c46a45]">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-xs font-medium text-[#9c958b]">{product.rating}</span>
                    </div>
                </div>

                <Link href={`/products/${product.slug}`} className="mt-3 block">
                    <h3 className="text-xl font-semibold tracking-[-0.04em]">{product.name}</h3>
                </Link>

                <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-bold">${hasSale ? product.salePrice : product.price}</span>
                    {hasSale && (
                        <>
                            <span className="text-sm text-[#8b867e] line-through">${product.price}</span>
                            <span className="rounded-sm bg-[#c46a45]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c46a45]">
                                Sale
                            </span>
                        </>
                    )}
                </div>

                <div className="mt-5 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => addToCart(product, product.colors[0], product.sizes[0], 1)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#c46a45] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#171614] shadow-[0_8px_24px_rgba(196,106,69,0.18)] transition duration-300 hover:bg-[#d9825d] hover:shadow-[0_8px_24px_rgba(196,106,69,0.18)]"
                    >
                        <ShoppingBag className="h-4 w-4" /> Quick Add
                    </button>
                </div>
            </div>
        </article>
    );
}
