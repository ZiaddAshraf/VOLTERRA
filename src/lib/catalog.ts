import type { Product } from "@/lib/types";

const singleProductImage = "/gym.png";

export function toProductViewModel(product: {
    id: string; name: string; slug: string; category: string; description: string; features: string[]; fit: string; compression: string; material: string; accent: string; rating: number; reviewCount: number; price: unknown; salePrice: unknown; compressionLevel: string; images: { url: string }[]; variants: { id: string; size: string; color: string; sku: string; stock: number; price: unknown }[];
}): Product {
    return {
        id: product.id, name: product.name, slug: product.slug, category: product.category as Product["category"], description: product.description, features: product.features, fit: product.fit, compression: product.compression, material: product.material, accent: product.accent, rating: product.rating, reviewCount: product.reviewCount, price: Number(product.price), salePrice: product.salePrice === null ? undefined : Number(product.salePrice), images: [singleProductImage, singleProductImage, singleProductImage], colors: [...new Set(product.variants.map((variant) => variant.color))] as Product["colors"], sizes: [...new Set(product.variants.map((variant) => variant.size))] as Product["sizes"], compressionLevel: product.compressionLevel as Product["compressionLevel"], variants: product.variants.map((variant) => ({ id: variant.id, size: variant.size as Product["sizes"][number], color: variant.color as Product["colors"][number], sku: variant.sku, stock: variant.stock, price: Number(variant.price) })),
    };
}

export const catalogInclude = { images: { orderBy: { sortOrder: "asc" as const } }, variants: true } as const;
