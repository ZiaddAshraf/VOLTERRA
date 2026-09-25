"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";

import type { CartItem, CustomerUser, Product, WishlistItem } from "@/lib/types";

const STORAGE_KEYS = {
    cart: "volterra-cart",
    wishlist: "volterra-wishlist",
    user: "volterra-user",
};

type StoreContextValue = {
    cart: CartItem[];
    wishlist: WishlistItem[];
    user: CustomerUser | null;
    addToCart: (product: Product, color: string, size: string, quantity?: number) => void;
    updateCartItem: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (id: string) => void;
    toggleWishlist: (product: Product) => void;
    isWishlisted: (productId: string) => boolean;
    login: (name: string, email: string, role?: "USER" | "ADMIN") => void;
    logout: () => void;
    register: (name: string, email: string, phone?: string) => void;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const defaultStoreContext: StoreContextValue = {
    cart: [],
    wishlist: [],
    user: null,
    addToCart: () => undefined,
    updateCartItem: () => undefined,
    removeFromCart: () => undefined,
    clearCart: () => undefined,
    addToWishlist: () => undefined,
    removeFromWishlist: () => undefined,
    toggleWishlist: () => undefined,
    isWishlisted: () => false,
    login: () => undefined,
    logout: () => undefined,
    register: () => undefined,
};

export function StoreProvider({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [user, setUser] = useState<CustomerUser | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        try {
            const savedCart = window.localStorage.getItem(STORAGE_KEYS.cart);
            const savedWishlist = window.localStorage.getItem(STORAGE_KEYS.wishlist);
            const savedUser = window.localStorage.getItem(STORAGE_KEYS.user);
            if (savedCart) setCart(JSON.parse(savedCart) as CartItem[]);
            if (savedWishlist) setWishlist(JSON.parse(savedWishlist) as WishlistItem[]);
            if (savedUser) setUser(JSON.parse(savedUser) as CustomerUser);
        } catch {
            window.localStorage.removeItem(STORAGE_KEYS.cart);
            window.localStorage.removeItem(STORAGE_KEYS.wishlist);
            window.localStorage.removeItem(STORAGE_KEYS.user);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated || status !== "authenticated") return;
        let cancelled = false;
        const syncCart = async () => {
            const localItems = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.cart) ?? "[]") as CartItem[];
            await Promise.all(localItems.filter((item) => item.variantId).map((item) => fetch("/api/account/cart", {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }),
            })));
            const response = await fetch("/api/account/cart");
            if (!response.ok || cancelled) return;
            const serverItems = await response.json();
            setCart(serverItems.map((item: { id: string; productId: string; variantId: string; color: string; size: string; quantity: number; product: { slug: string; name: string; images: { url: string }[] }; variant: { price: string | number } }) => ({
                id: `${item.productId}-${item.variantId}`, productId: item.productId, variantId: item.variantId, slug: item.product.slug, name: item.product.name, image: "/gym.png", color: item.color, size: item.size, quantity: item.quantity, price: Number(item.variant.price),
            })));
        };
        syncCart().catch(() => undefined);
        return () => { cancelled = true; };
    }, [isHydrated, status]);

    useEffect(() => {
        if (!isHydrated) return;
        window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    }, [cart, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        window.localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
    }, [wishlist, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        if (user) window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        else window.localStorage.removeItem(STORAGE_KEYS.user);
    }, [user, isHydrated]);

    const addToCart = (product: Product, color: string, size: string, quantity = 1) => {
        const variant = product.variants.find((item) => item.color === color && item.size === size);
        if (!variant) return;
        setCart((currentCart) => {
            const match = currentCart.find(
                (item) => item.variantId === variant.id,
            );

            if (match) {
                return currentCart.map((item) =>
                    item.id === match.id ? { ...item, quantity: item.quantity + quantity } : item,
                );
            }

            const nextItem: CartItem = {
                id: `${product.id}-${color}-${size}`,
                productId: product.id,
                variantId: variant.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0],
                color,
                size,
                quantity,
                price: product.salePrice ?? product.price,
            };

            return [...currentCart, nextItem];
        });
        void fetch("/api/account/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: variant.id, quantity }) });
    };

    const updateCartItem = (id: string, quantity: number) => {
        setCart((currentCart) =>
            currentCart
                .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
                .filter((item) => item.quantity > 0),
        );
        if (status === "authenticated") {
            const item = cart.find((candidate) => candidate.id === id);
            if (item) void fetch("/api/account/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: item.variantId, quantity: Math.max(1, quantity) }) });
        }
    };

    const removeFromCart = (id: string) => {
        const item = cart.find((candidate) => candidate.id === id);
        setCart((currentCart) => currentCart.filter((item) => item.id !== id));
        if (status === "authenticated" && item) void fetch("/api/account/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: item.variantId }) });
    };

    const clearCart = () => setCart([]);

    const addToWishlist = (product: Product) => {
        setWishlist((currentWishlist) => {
            if (currentWishlist.some((item) => item.productId === product.id)) return currentWishlist;

            return [
                ...currentWishlist,
                {
                    id: product.id,
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.images[0],
                    price: product.salePrice ?? product.price,
                    category: product.category,
                },
            ];
        });
        if (status === "authenticated") void fetch("/api/account/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
    };

    const removeFromWishlist = (id: string) => {
        setWishlist((currentWishlist) => currentWishlist.filter((item) => item.productId !== id));
        if (status === "authenticated") void fetch("/api/account/wishlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id }) });
    };

    const isWishlisted = (productId: string) => wishlist.some((item) => item.productId === productId);

    const toggleWishlist = (product: Product) => {
        if (isWishlisted(product.id)) removeFromWishlist(product.id);
        else addToWishlist(product);
    };

    const login = (name: string, email: string, role: "USER" | "ADMIN" = "USER") => {
        setUser({ id: crypto.randomUUID(), name, email, role });
    };

    const register = (name: string, email: string, phone?: string) => {
        setUser({ id: crypto.randomUUID(), name, email, phone, role: "USER" });
    };

    const logout = () => setUser(null);

    const value: StoreContextValue = {
        cart,
        wishlist,
        user,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        login,
        logout,
        register,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
    const context = useContext(StoreContext);
    return context ?? defaultStoreContext;
}
