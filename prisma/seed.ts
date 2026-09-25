import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { allProducts } from "../src/lib/data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
    for (const product of allProducts) {
        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {
                name: product.name,
                category: product.category,
                description: product.description,
                features: product.features,
                fit: product.fit,
                compression: product.compression,
                material: product.material,
                accent: product.accent,
                price: product.price,
                salePrice: product.salePrice,
                rating: product.rating,
                reviewCount: product.reviewCount,
                compressionLevel: product.compressionLevel,
                images: {
                    deleteMany: {},
                    create: product.images.map((url, sortOrder) => ({ url, alt: product.name, sortOrder })),
                },
            },
            create: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                category: product.category,
                description: product.description,
                features: product.features,
                fit: product.fit,
                compression: product.compression,
                material: product.material,
                accent: product.accent,
                price: product.price,
                salePrice: product.salePrice,
                rating: product.rating,
                reviewCount: product.reviewCount,
                compressionLevel: product.compressionLevel,
                images: {
                    create: product.images.map((url, sortOrder) => ({ url, alt: product.name, sortOrder })),
                },
                variants: {
                    create: product.variants.map((variant) => ({
                        id: variant.id,
                        color: variant.color,
                        size: variant.size,
                        sku: variant.sku,
                        stock: variant.stock,
                        price: variant.price,
                    })),
                },
            },
        });
    }

    await prisma.coupon.upsert({
        where: { code: "VOLTERRA15" },
        update: { active: true, type: "PERCENTAGE", value: 15 },
        create: { code: "VOLTERRA15", type: "PERCENTAGE", value: 15, minimumOrder: 75 },
    });
}

main().finally(() => prisma.$disconnect());
