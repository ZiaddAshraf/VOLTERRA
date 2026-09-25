import { ProductCard } from "@/components/products/product-card";
import { catalogInclude, toProductViewModel } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export default async function WomenShopPage() {
    const records = await prisma.product.findMany({ where: { category: "Women's Compression Shirts" }, include: catalogInclude, orderBy: { createdAt: "desc" } });
    const products = records.map(toProductViewModel);

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">Women</p>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em]">Women&apos;s Compression Shirts</h1>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
