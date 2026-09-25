"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, Star } from "lucide-react";

import { useStore } from "@/components/providers/store-provider";
import { ReviewsSection } from "@/components/products/reviews-section";

const sizeGuide = [
    { size: "XS", chest: "32–34\"", waist: "26–28\"" },
    { size: "S", chest: "34–36\"", waist: "28–30\"" },
    { size: "M", chest: "36–38\"", waist: "30–32\"" },
    { size: "L", chest: "38–41\"", waist: "32–35\"" },
    { size: "XL", chest: "41–44\"", waist: "35–38\"" },
    { size: "XXL", chest: "44–47\"", waist: "38–41\"" },
];

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<import("@/lib/types").Product | null>(null);
    const [loadError, setLoadError] = useState(false);
    useEffect(() => { fetch(`/api/products/${slug}`).then((response) => { if (!response.ok) throw new Error("Not found"); return response.json(); }).then(setProduct).catch(() => setLoadError(true)); }, [slug]);
    const router = useRouter();
    const { addToCart, toggleWishlist, isWishlisted } = useStore();
    const [selectedColor, setSelectedColor] = useState("Black");
    const [selectedSize, setSelectedSize] = useState("M");
    const [quantity, setQuantity] = useState(1);

    if (loadError) notFound();
    if (!product) return <div className="mx-auto max-w-3xl px-6 py-20 text-center">Loading product...</div>;
    const activeColor = (product.colors.includes(selectedColor as typeof product.colors[number]) ? selectedColor : product.colors[0]) as typeof product.colors[number];
    const activeSize = (product.sizes.includes(selectedSize as typeof product.sizes[number]) ? selectedSize : product.sizes[0]) as typeof product.sizes[number];
    const price = product.salePrice ?? product.price;
    const selectedVariant = product.variants.find((variant) => variant.color === activeColor && variant.size === activeSize);
    const availableSizes = product.sizes.filter((size) => product.variants.some((variant) => variant.color === activeColor && variant.size === size));
    const stockLabel = !selectedVariant || selectedVariant.stock === 0 ? "Out of Stock" : selectedVariant.stock < 5 ? `Only ${selectedVariant.stock} left` : "In Stock";

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
            <div className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                <Link href="/shop" className="hover:text-zinc-900">Shop</Link>
                <span>/</span>
                <span>{product.category}</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {product.images.map((image, index) => (
                            <Image
                                key={image}
                                src={image}
                                alt={`${product.name} ${index + 1}`}
                                width={1200}
                                height={520}
                                className={`h-80 w-full rounded-[24px] object-cover ${index === 0 ? "md:col-span-2 md:h-[520px]" : "h-80 md:h-[250px]"}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-[0.26em] text-zinc-500">{product.category}</p>
                    <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.08em]">{product.name}</h1>

                    <div className="mt-4 flex items-center gap-3 text-sm text-zinc-600">
                        <div className="flex items-center gap-1 text-[#d8452a]">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-semibold text-zinc-900">{product.rating}</span>
                        </div>
                        <span>({product.reviewCount} reviews)</span>
                    </div>

                    <div className="mt-5 flex items-end gap-3">
                        <span className="text-3xl font-black">${price}</span>
                        {product.salePrice && (
                            <>
                                <span className="text-xl text-zinc-400 line-through">${product.price}</span>
                                <span className="rounded-full bg-[#d8452a]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d8452a]">
                                    Sale
                                </span>
                            </>
                        )}
                    </div>

                    <div className="mt-6 border-t border-black/5 pt-6">
                        <div className="flex items-center justify-between text-sm font-medium uppercase tracking-[0.18em] text-zinc-600">
                            <span>Color</span>
                            <span className="text-zinc-900">{activeColor}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => { setSelectedColor(color); if (!availableSizes.includes(activeSize)) setSelectedSize(availableSizes[0] ?? product.sizes[0]); }}
                                    className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] ${activeColor === color ? "border-[#d8452a] bg-[#d8452a] text-white" : "border-black/10 bg-white text-zinc-700"}`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between text-sm font-medium uppercase tracking-[0.18em] text-zinc-600">
                            <span>Size</span>
                            <span className="text-zinc-900">{activeSize}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    disabled={!availableSizes.includes(size)}
                                    onClick={() => setSelectedSize(size)}
                                    className={`min-w-[52px] rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-35 ${activeSize === size ? "border-[#d8452a] bg-[#d8452a] text-white" : "border-black/10 bg-white text-zinc-700"}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-2xl border border-black/5 bg-[#f8f7f6] px-4 py-3">
                        <span className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-600">Compression level</span>
                        <span className="text-sm font-semibold text-zinc-900">{product.compressionLevel}</span>
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-2xl border border-black/5 bg-[#f8f7f6] px-4 py-3">
                        <span className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-600">Stock</span>
                        <span className={`text-sm font-semibold ${stockLabel === "Out of Stock" ? "text-red-600" : "text-emerald-600"}`}>{stockLabel}</span>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-black/10 bg-white">
                            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3 text-zinc-700">
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
                            <button type="button" onClick={() => setQuantity((value) => Math.min(selectedVariant?.stock ?? 20, value + 1))} className="p-3 text-zinc-700">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <button type="button" disabled={!selectedVariant || selectedVariant.stock < quantity} onClick={() => selectedVariant && addToCart(product, selectedVariant.color, selectedVariant.size, quantity)} className="flex-1 rounded-full bg-[#d8452a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#ef5a3a] disabled:cursor-not-allowed disabled:opacity-40">
                            Add to cart
                        </button>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <button type="button" disabled={!selectedVariant || selectedVariant.stock < quantity} onClick={() => { if (selectedVariant) { addToCart(product, selectedVariant.color, selectedVariant.size, quantity); router.push("/cart"); } }} className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40">
                            Buy now
                        </button>
                        <button type="button" onClick={() => toggleWishlist(product)} className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700">
                            <span className="inline-flex items-center gap-2"><Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-[#d8452a] text-[#d8452a]" : ""}`} /> {isWishlisted(product.id) ? "Saved" : "Wishlist"}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                    <div className="mb-6 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Description</div>
                    <p className="text-base leading-7 text-zinc-700">{product.description}</p>

                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700">Fabric</h3>
                            <p className="mt-2 text-zinc-600">{product.material}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700">Fit</h3>
                            <p className="mt-2 text-zinc-600">{product.fit}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700">Compression</h3>
                            <p className="mt-2 text-zinc-600">{product.compression}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700">Breathability</h3>
                            <p className="mt-2 text-zinc-600">Engineered airflow with performance-first mesh comfort.</p>
                        </div>
                    </div>

                    <div className="mt-10">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700">Features</h3>
                        <ul className="mt-4 grid gap-3 md:grid-cols-2">
                            {product.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-[#f8f7f6] px-4 py-3 text-sm text-zinc-700">
                                    <ShieldCheck className="h-4 w-4 text-[#d8452a]" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                    <div className="mb-6 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Size Guide</div>
                    <div className="overflow-hidden rounded-2xl border border-black/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8f7f6] text-zinc-600">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Size</th>
                                    <th className="px-4 py-3 font-medium">Chest</th>
                                    <th className="px-4 py-3 font-medium">Waist</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sizeGuide.map((row) => (
                                    <tr key={row.size} className="border-t border-black/5">
                                        <td className="px-4 py-3 font-semibold text-zinc-900">{row.size}</td>
                                        <td className="px-4 py-3 text-zinc-700">{row.chest}</td>
                                        <td className="px-4 py-3 text-zinc-700">{row.waist}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ReviewsSection productSlug={product.slug} />
        </div>
    );
}
