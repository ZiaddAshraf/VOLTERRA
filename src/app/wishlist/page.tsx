"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/components/providers/store-provider";

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, addToCart } = useStore();
    const [addingProductId, setAddingProductId] = useState<string | null>(null);

    const handleAddToCart = async (productId: string) => {
        const item = wishlist.find((wishlistItem) => wishlistItem.productId === productId);
        if (!item) return;

        setAddingProductId(productId);
        try {
            const response = await fetch(`/api/products/${item.slug}`);
            if (!response.ok) return;
            const product = await response.json() as import("@/lib/types").Product;
            const variant = product.variants.find((productVariant) => productVariant.stock > 0);
            if (!variant) return;
            addToCart(product, variant.color, variant.size, 1);
        } finally {
            setAddingProductId(null);
        }
    };

    if (wishlist.length === 0) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-16 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d8452a]/10 text-[#d8452a]">
                    <Heart className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Your wishlist is empty.</h1>
                <p className="mt-4 text-zinc-600">Save the shirts you love and move them to cart when you’re ready.</p>
                <Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#d8452a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    Browse shirts
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
            <h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Wishlist</h1>
            <div className="mt-6 grid gap-5">
                {wishlist.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-black/5 bg-white p-4 shadow-sm md:flex-row md:items-center">
                        <Image src={item.image} alt={item.name} width={112} height={112} className="h-28 w-28 rounded-[20px] object-cover" />
                        <div className="flex-1">
                            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">{item.category}</div>
                            <Link href={`/products/${item.slug}`} className="mt-2 block text-2xl font-semibold tracking-[-0.04em]">{item.name}</Link>
                            <div className="mt-2 text-xl font-bold">${item.price}</div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => void handleAddToCart(item.productId)} disabled={addingProductId === item.productId}>
                                <ShoppingBag className="h-4 w-4" /> {addingProductId === item.productId ? "Adding..." : "Add to cart"}
                            </Button>
                            <Button variant="secondary" onClick={() => removeFromWishlist(item.productId)}>
                                <Trash2 className="h-4 w-4" /> Remove
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
