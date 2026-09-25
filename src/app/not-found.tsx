import Link from "next/link";

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-zinc-500">404</p>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-[-0.07em]">Page not found.</h1>
            <p className="mt-4 text-zinc-600">The compression shirt you’re looking for isn’t here.</p>
            <Link
                href="/shop"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#d8452a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#ef5a3a]"
            >
                Return to Shop
            </Link>
        </div>
    );
}
