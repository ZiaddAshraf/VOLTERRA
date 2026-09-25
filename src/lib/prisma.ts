import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { allProducts } from "@/lib/data";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const fallbackUsers: Array<Record<string, unknown>> = [];

const fallbackProducts = allProducts.map((product) => ({
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
    rating: product.rating,
    reviewCount: product.reviewCount,
    price: Number(product.price),
    salePrice: product.salePrice == null ? null : Number(product.salePrice),
    compressionLevel: product.compressionLevel,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: product.images.map((url, index) => ({
        id: `${product.id}-image-${index}`,
        productId: product.id,
        url,
        alt: product.name,
        sortOrder: index,
    })),
    variants: product.variants.map((variant) => ({
        id: variant.id,
        productId: product.id,
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        stock: variant.stock,
        price: Number(variant.price),
    })),
}));

function matchesQuery(value: string, query: string) {
    return value.toLowerCase().includes(query.toLowerCase());
}

function filterProducts(where: Record<string, unknown> = {}) {
    let items = [...fallbackProducts];

    if (where.category) {
        items = items.filter((product) => product.category === where.category);
    }

    if (where.slug) {
        items = items.filter((product) => product.slug === where.slug);
    }

    if (where.id) {
        items = items.filter((product) => product.id === where.id);
    }

    const orClauses = Array.isArray(where.OR) ? where.OR : [];
    if (orClauses.length > 0) {
        items = items.filter((product) =>
            orClauses.some((clause) => {
                const query = (clause as Record<string, unknown>).name as Record<string, unknown> | undefined;
                if (query && typeof query.contains === "string") {
                    return matchesQuery(product.name, query.contains) || matchesQuery(product.description, query.contains) || matchesQuery(product.category, query.contains);
                }
                return false;
            }),
        );
    }

    return items;
}

function createFallbackPrismaClient() {
    const product = {
        findMany: async ({ where = {}, orderBy }: Record<string, unknown> = {}) => {
            const items = filterProducts(where as Record<string, unknown>);
            if ((orderBy as Record<string, unknown> | undefined)?.createdAt === "desc") {
                items.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
            }
            return items;
        },
        findUnique: async ({ where }: Record<string, unknown>) => {
            const items = filterProducts(where as Record<string, unknown>);
            return items[0] ?? null;
        },
        count: async ({ where = {} }: Record<string, unknown> = {}) => filterProducts(where as Record<string, unknown>).length,
        create: async ({ data }: Record<string, unknown>) => {
            const record = data as Record<string, any>;
            return Object.assign({}, record, {
                id: record.id ?? `fallback-product-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        },
        update: async ({ data }: Record<string, unknown>) => {
            const record = data as Record<string, any>;
            return Object.assign({}, record, { updatedAt: new Date() });
        },
        delete: async () => ({ success: true }),
        aggregate: async () => ({ _sum: { total: 0 } }),
    };

    const productVariant = {
        count: async ({ where }: Record<string, unknown> = {}) => {
            const threshold = (where as Record<string, unknown>)?.stock as Record<string, unknown> | undefined;
            const max = threshold && typeof threshold.lt === "number" ? threshold.lt : Number.POSITIVE_INFINITY;
            return fallbackProducts.flatMap((product) => product.variants).filter((variant) => variant.stock < max).length;
        },
        findUnique: async ({ where }: Record<string, unknown>) => {
            const id = (where as Record<string, unknown>)?.id as string | undefined;
            return fallbackProducts.flatMap((product) => product.variants).find((variant) => variant.id === id) ?? null;
        },
        create: async ({ data }: Record<string, unknown>) => {
            const record = data as Record<string, any>;
            return Object.assign({}, record, { id: record.id ?? `fallback-variant-${Date.now()}` });
        },
        update: async ({ data }: Record<string, unknown>) => {
            const record = data as Record<string, any>;
            return Object.assign({}, record, { updatedAt: new Date() });
        },
        delete: async () => ({ success: true }),
    };

    const user = {
        findUnique: async ({ where }: Record<string, unknown>) => {
            const email = (where as Record<string, unknown>)?.email as string | undefined;
            const id = (where as Record<string, unknown>)?.id as string | undefined;
            return fallbackUsers.find((userRecord) => (email ? userRecord.email === email : userRecord.id === id)) ?? null;
        },
        count: async ({ where }: Record<string, unknown> = {}) => {
            const role = (where as Record<string, unknown>)?.role as string | undefined;
            return fallbackUsers.filter((userRecord) => (role ? userRecord.role === role : true)).length;
        },
        create: async ({ data }: Record<string, unknown>) => {
            const record = Object.assign({}, data as Record<string, any>, {
                id: (data as Record<string, any>).id ?? `fallback-user-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            fallbackUsers.push(record);
            return record;
        },
        update: async ({ where, data }: Record<string, unknown>) => {
            const index = fallbackUsers.findIndex((userRecord) => userRecord.id === (where as Record<string, unknown>)?.id || userRecord.email === (where as Record<string, unknown>)?.email);
            if (index === -1) {
                return null;
            }
            fallbackUsers[index] = Object.assign({}, fallbackUsers[index], data as Record<string, any>, { updatedAt: new Date() });
            return fallbackUsers[index];
        },
        findMany: async () => fallbackUsers,
    };

    const order = {
        findMany: async () => [],
        findFirst: async () => null,
        count: async () => 0,
        aggregate: async () => ({ _sum: { total: 0 } }),
        create: async ({ data }: Record<string, unknown>) => {
            const record = data as Record<string, any>;
            return Object.assign({}, record, {
                id: record.id ?? `fallback-order-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        },
        update: async ({ data }: Record<string, unknown>) => {
            const record = data as Record<string, any>;
            return Object.assign({}, record, { updatedAt: new Date() });
        },
        findUnique: async () => null,
    };

    const coupon = {
        findMany: async () => [],
        findUnique: async () => null,
        create: async ({ data }: Record<string, unknown>) => {
            const record = data as Record<string, any>;
            return Object.assign({}, record, {
                id: record.id ?? `fallback-coupon-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        },
        update: async ({ data }: Record<string, unknown>) => {
            const record = data as Record<string, any>;
            return Object.assign({}, record, { updatedAt: new Date() });
        },
        delete: async () => ({ success: true }),
    };

    const cart = { findUnique: async () => null, upsert: async ({ create }: Record<string, unknown>) => Object.assign({}, create as Record<string, any>, { items: [] }), delete: async () => ({ success: true }) };
    const wishlist = { findUnique: async () => null, upsert: async ({ create }: Record<string, unknown>) => Object.assign({}, create as Record<string, any>, { items: [] }), delete: async () => ({ success: true }) };
    const address = { findMany: async () => [], findFirst: async () => null, deleteMany: async () => ({ count: 0 }), create: async ({ data }: Record<string, unknown>) => Object.assign({}, data as Record<string, any>, { id: (data as Record<string, any>).id ?? `fallback-address-${Date.now()}` }) };
    const review = { findMany: async () => [], create: async ({ data }: Record<string, unknown>) => Object.assign({}, data as Record<string, any>, { id: (data as Record<string, any>).id ?? `fallback-review-${Date.now()}`, createdAt: new Date() }), findFirst: async () => null };

    return {
        product,
        productVariant,
        user,
        order,
        coupon,
        cart,
        wishlist,
        address,
        review,
        $transaction: async (callback: (transaction: Record<string, unknown>) => unknown) => callback({ product, user, order, coupon, cart, wishlist, address, review, productVariant }),
    } as unknown as PrismaClient;
}

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        return createFallbackPrismaClient();
    }

    return new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
