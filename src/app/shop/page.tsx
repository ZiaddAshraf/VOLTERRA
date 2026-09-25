"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/types";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Black", "White", "Navy", "Grey", "Red"];
const compressionLevels = ["Light", "Performance", "Recovery", "Elite"];

export default function ShopPage() {
    const [selectedMen, setSelectedMen] = useState(true);
    const [selectedWomen, setSelectedWomen] = useState(true);
    const [sizeFilter, setSizeFilter] = useState<string[]>([]);
    const [colorFilter, setColorFilter] = useState<string[]>([]);
    const [compressionFilter, setCompressionFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("featured");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { fetch("/api/products").then((response) => response.json()).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false)); }, []);

    const filteredProducts = useMemo(() => {
        const filtered = products.filter((product) => {
            const categoryMatch =
                (selectedMen && product.category === "Men's Compression Shirts") ||
                (selectedWomen && product.category === "Women's Compression Shirts");

            const sizeMatch =
                sizeFilter.length === 0 ||
                sizeFilter.some((filterSize) => product.sizes.includes(filterSize as (typeof product.sizes)[number]));

            const colorMatch =
                colorFilter.length === 0 ||
                colorFilter.some((filterColor) => product.colors.includes(filterColor as (typeof product.colors)[number]));

            const compressionMatch =
                compressionFilter.length === 0 ||
                compressionFilter.includes(product.compressionLevel);

            return categoryMatch && sizeMatch && colorMatch && compressionMatch;
        });

        switch (sortBy) {
            case "newest":
                return [...filtered].sort((a, b) => b.reviewCount - a.reviewCount);
            case "price-low":
                return [...filtered].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
            case "price-high":
                return [...filtered].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
            case "best-selling":
                return [...filtered].sort((a, b) => b.reviewCount - a.reviewCount);
            default:
                return filtered;
        }
    }, [products, selectedMen, selectedWomen, sizeFilter, colorFilter, compressionFilter, sortBy]);

    const toggleValue = (setState: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setState((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">Compression shirts</p>
                    <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em]">Shop all</h1>
                </div>
                <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] md:hidden"
                >
                    <Filter className="h-4 w-4" /> Filters
                </button>
            </div>

            <div className="hidden md:grid md:grid-cols-[260px_1fr] md:gap-8">
                <aside className="rounded-[26px] border border-black/5 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-700">
                        <SlidersHorizontal className="h-4 w-4" /> Filters
                    </div>

                    <div className="mt-8 space-y-8">
                        <div>
                            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Category</h3>
                            <div className="mt-3 space-y-2">
                                <label className="flex items-center gap-2 text-sm text-zinc-700">
                                    <input type="checkbox" checked={selectedMen} onChange={() => setSelectedMen((val) => !val)} /> Men&apos;s
                                </label>
                                <label className="flex items-center gap-2 text-sm text-zinc-700">
                                    <input type="checkbox" checked={selectedWomen} onChange={() => setSelectedWomen((val) => !val)} /> Women&apos;s
                                </label>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Size</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => toggleValue(setSizeFilter, size)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium ${sizeFilter.includes(size) ? "border-[#d8452a] bg-[#d8452a] text-white" : "border-black/10 bg-white text-zinc-700"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Color</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => toggleValue(setColorFilter, color)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium ${colorFilter.includes(color) ? "border-[#d8452a] bg-[#d8452a] text-white" : "border-black/10 bg-white text-zinc-700"
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Compression</h3>
                            <div className="mt-3 space-y-2">
                                {compressionLevels.map((level) => (
                                    <label key={level} className="flex items-center gap-2 text-sm text-zinc-700">
                                        <input
                                            type="checkbox"
                                            checked={compressionFilter.includes(level)}
                                            onChange={() => toggleValue(setCompressionFilter, level)}
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <div>
                    <div className="mb-6 flex items-center justify-between rounded-[24px] border border-black/5 bg-white px-5 py-4 shadow-sm">
                        <div className="text-sm text-zinc-600">{filteredProducts.length} products</div>
                        <select
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                            className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none"
                        >
                            <option value="featured">Featured</option>
                            <option value="newest">Newest</option>
                            <option value="best-selling">Best Selling</option>
                            <option value="price-low">Price Low → High</option>
                            <option value="price-high">Price High → Low</option>
                        </select>
                    </div>

                    {loading ? <div className="text-zinc-600">Loading shirts...</div> : <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>}
                </div>
            </div>

            <div className="md:hidden">
                <div className="mb-6 flex items-center justify-between rounded-[24px] border border-black/5 bg-white px-4 py-3 shadow-sm">
                    <div className="text-sm text-zinc-600">{filteredProducts.length} products</div>
                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none"
                    >
                        <option value="featured">Featured</option>
                        <option value="newest">Newest</option>
                        <option value="best-selling">Best Selling</option>
                        <option value="price-low">Price Low → High</option>
                        <option value="price-high">Price High → Low</option>
                    </select>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 flex bg-black/40 md:hidden">
                    <aside className="ml-auto h-full w-[85%] overflow-y-auto bg-white p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold uppercase tracking-[0.16em]">Filters</h3>
                            <button type="button" onClick={() => setMobileFiltersOpen(false)} className="text-sm">Close</button>
                        </div>
                        <div className="mt-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Category</h4>
                                <div className="mt-3 space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-zinc-700"><input type="checkbox" checked={selectedMen} onChange={() => setSelectedMen((val) => !val)} /> Men&apos;s</label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-700"><input type="checkbox" checked={selectedWomen} onChange={() => setSelectedWomen((val) => !val)} /> Women&apos;s</label>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Size</h4>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {sizes.map((size) => (
                                        <button key={size} type="button" onClick={() => toggleValue(setSizeFilter, size)} className={`rounded-full border px-3 py-1.5 text-xs ${sizeFilter.includes(size) ? "border-[#d8452a] bg-[#d8452a] text-white" : "border-black/10 bg-white text-zinc-700"}`}>
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Color</h4>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {colors.map((color) => (
                                        <button key={color} type="button" onClick={() => toggleValue(setColorFilter, color)} className={`rounded-full border px-3 py-1.5 text-xs ${colorFilter.includes(color) ? "border-[#d8452a] bg-[#d8452a] text-white" : "border-black/10 bg-white text-zinc-700"}`}>
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button type="button" onClick={() => setMobileFiltersOpen(false)} className="mt-8 w-full rounded-full bg-[#d8452a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                            Apply filters
                        </button>
                    </aside>
                </div>
            )}
        </div>
    );
}
