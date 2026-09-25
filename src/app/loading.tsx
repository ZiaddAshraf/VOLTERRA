export default function Loading() {
    return (
        <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-[28px] border border-black/10 bg-white p-3 shadow-sm">
                        <div className="h-72 rounded-[22px] bg-zinc-200" />
                        <div className="mt-4 h-5 w-2/3 rounded bg-zinc-200" />
                        <div className="mt-3 h-4 w-1/3 rounded bg-zinc-200" />
                        <div className="mt-5 h-10 rounded-full bg-zinc-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}
