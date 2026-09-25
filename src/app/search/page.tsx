"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(query), 250);
        return () => clearTimeout(id);
    }, [query]);

    useEffect(() => { if (!debouncedQuery.trim()) return; fetch(`/api/products?q=${encodeURIComponent(debouncedQuery)}`).then((response) => response.json()).then(setResults).catch(() => setResults([])); }, [debouncedQuery]);

    const suggestions = [
        "black compression",
        "women's compression shirts",
        "elite recovery",
        "performance fit",
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-black uppercase tracking-[-0.08em]">Search</h1>
                <div className="mt-6">
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product name, description, or category" className="h-12" />
                </div>

                {!debouncedQuery && (
                    <div className="mt-8 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                        <div className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Suggestions</div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {suggestions.map((suggestion) => (
                                <button key={suggestion} type="button" onClick={() => setQuery(suggestion)} className="rounded-full border border-black/10 bg-[#f8f7f6] px-4 py-2 text-sm text-zinc-700">
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {query !== debouncedQuery && <p className="mt-8 text-center text-zinc-600">Searching shirts...</p>}
                {query === debouncedQuery && debouncedQuery && results.length === 0 && (
                    <div className="mt-8 rounded-[28px] border border-black/5 bg-white p-8 text-center shadow-sm">
                        <h2 className="text-2xl font-black uppercase tracking-[-0.06em]">No results found.</h2>
                        <p className="mt-3 text-zinc-600">Try searching for black compression, women’s performance, or recovery fit.</p>
                    </div>
                )}

                {query === debouncedQuery && debouncedQuery && results.length > 0 && (
                    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {results.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
