import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { catalogInclude, toProductViewModel } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export default async function Home() {
    const records = await prisma.product.findMany({ include: catalogInclude, orderBy: { createdAt: "desc" } });
    const products = records.map(toProductViewModel);
    const featured = products.slice(0, 4);
    const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
    return (
        <div className="bg-[#121212] text-[#e8e1d5]">
            <section className="relative overflow-hidden bg-[#181716] text-[#e8e1d5]">
                <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-32">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c46a45]">Performance equipment</p>
                        <h1 className="mt-5 max-w-3xl text-6xl font-black uppercase leading-[0.88] tracking-[-0.09em] md:text-8xl">Compression without compromise.</h1>
                        <p className="mt-7 max-w-xl text-lg leading-8 text-[#9c958b]">Premium compression shirts engineered for strength, speed, and recovery.</p>
                        <Link href="/shop" className="mt-9 inline-flex rounded-md bg-[#c46a45] px-7 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#171614] shadow-[0_8px_24px_rgba(196,106,69,0.18)] transition duration-300 hover:bg-[#d9825d] hover:shadow-[0_8px_24px_rgba(196,106,69,0.18)]">Shop the collection</Link>
                    </div>
                    <div className="min-h-[360px] rounded-md border border-[rgba(232,225,213,0.1)] bg-[url('/gym.png')] bg-cover bg-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]" />
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-16">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#706b64]">The collection</p>
                        <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] text-[#e8e1d5]">Featured shirts</h2>
                    </div>
                    <Link href="/shop" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c46a45] hover:text-[#d9825d]">View all</Link>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            </section>

            <section className="bg-[#181716]">
                <div className="mx-auto max-w-7xl px-6 py-16">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#706b64]">Proven in motion</p>
                    <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] text-[#e8e1d5]">Best sellers</h2>
                    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{bestSellers.map((product) => <ProductCard key={product.id} product={product} dark />)}</div>
                </div>
            </section>
        </div>
    );
}
