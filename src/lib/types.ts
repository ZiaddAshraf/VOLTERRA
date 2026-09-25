export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type ColorOption = "Black" | "White" | "Navy" | "Grey" | "Red";
export type CompressionLevel = "Light" | "Performance" | "Recovery" | "Elite";

export type ProductVariant = {
    id: string;
    size: Size;
    color: ColorOption;
    sku: string;
    stock: number;
    price: number;
};

export type Product = {
    id: string;
    name: string;
    slug: string;
    category: "Men's Compression Shirts" | "Women's Compression Shirts";
    description: string;
    features: string[];
    fit: string;
    compression: string;
    material: string;
    accent: string;
    rating: number;
    reviewCount: number;
    price: number;
    salePrice?: number;
    images: string[];
    colors: ColorOption[];
    sizes: Size[];
    compressionLevel: CompressionLevel;
    variants: ProductVariant[];
};

export type CartItem = {
    id: string;
    productId: string;
    variantId: string;
    slug: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
};

export type WishlistItem = {
    id: string;
    productId: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    category: Product["category"];
};

export type CustomerUser = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "USER" | "ADMIN";
};
