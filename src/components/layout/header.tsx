"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

import { useStore } from "@/components/providers/store-provider";

const navItems = [
    { label: "Shop", href: "/shop" },
    { label: "Men", href: "/shop/men" },
    { label: "Women", href: "/shop/women" },
    { label: "New Arrivals", href: "/shop" },
    { label: "Sale", href: "/shop" },
];

export function Header() {
    const { cart, wishlist, user } = useStore();

    return (
        <header className="sticky top-0 z-50 border-b border-[rgba(232,225,213,0.1)] bg-[#121212]/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
                <div className="flex items-center gap-4 md:gap-8">
                    <Link href="/" className="text-xl font-black uppercase tracking-[0.22em] text-[#e8e1d5]">
                        VOLTERRA
                    </Link>
                    <nav className="hidden items-center gap-6 md:flex">
                        {navItems.map((item) => (
                            <Link key={item.label} href={item.href} className="text-xs font-medium uppercase tracking-[0.18em] text-[#9c958b] hover:text-[#e8e1d5]">
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <Link href="/search" className="rounded-md border border-[rgba(232,225,213,0.1)] bg-[#181716] p-2.5 text-[#d8d1c5] hover:border-[#c46a45] hover:text-[#e8e1d5]" aria-label="Search">
                        <Search className="h-4 w-4" />
                    </Link>
                    <Link href={user ? "/account" : "/login"} className="rounded-md border border-[rgba(232,225,213,0.1)] bg-[#181716] p-2.5 text-[#d8d1c5] hover:border-[#c46a45] hover:text-[#e8e1d5]" aria-label="Account">
                        <User className="h-4 w-4" />
                    </Link>
                    <Link href="/wishlist" className="relative rounded-md border border-[rgba(232,225,213,0.1)] bg-[#181716] p-2.5 text-[#d8d1c5] hover:border-[#c46a45] hover:text-[#e8e1d5]" aria-label="Wishlist">
                        <Heart className="h-4 w-4" />
                        {wishlist.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d8452a] px-1 text-[9px] font-bold text-white">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>
                    <Link href="/cart" className="relative rounded-md border border-[rgba(232,225,213,0.1)] bg-[#181716] p-2.5 text-[#d8d1c5] hover:border-[#c46a45] hover:text-[#e8e1d5]" aria-label="Cart">
                        <ShoppingBag className="h-4 w-4" />
                        {cart.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d8452a] px-1 text-[9px] font-bold text-white">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
