import Link from "next/link";

const footerLinks = {
    Shop: [
        { label: "Men", href: "/shop/men" },
        { label: "Women", href: "/shop/women" },
        { label: "New Arrivals", href: "/shop" },
    ],
    Company: [
        { label: "About", href: "/about" },
        { label: "Shipping", href: "/shipping" },
        { label: "Returns", href: "/returns" },
        { label: "Contact", href: "/contact" },
    ],
    Legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
    ],
};

export function Footer() {
    return (
        <footer className="border-t border-[rgba(232,225,213,0.1)] bg-[#181716] text-[#e8e1d5]">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
                <div>
                    <div className="text-xl font-black uppercase tracking-[0.22em]">VOLTERRA</div>
                    <p className="mt-4 max-w-xs text-sm text-[#9c958b]">
                        Premium compression shirts designed to move with your training, recovery, and performance goals.
                    </p>
                </div>

                {Object.entries(footerLinks).map(([title, links]) => (
                    <div key={title}>
                        <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-[#706b64]">{title}</h3>
                        <ul className="mt-4 space-y-3 text-sm text-[#9c958b]">
                            {links.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="transition duration-300 hover:text-[#e8e1d5]">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-[#706b64]">Follow</h3>
                    <div className="mt-4 flex gap-3 text-sm text-[#9c958b]">
                        <a href="https://instagram.com" className="transition duration-300 hover:text-[#e8e1d5]">Instagram</a>
                        <a href="https://x.com" className="transition duration-300 hover:text-[#e8e1d5]">X</a>
                        <a href="https://youtube.com" className="transition duration-300 hover:text-[#e8e1d5]">YouTube</a>
                    </div>
                </div>
            </div>
            <div className="border-t border-[rgba(232,225,213,0.1)] py-4 text-center text-xs uppercase tracking-[0.2em] text-[#706b64]">
                © 2026 VOLTERRA — BUILT TO PERFORM.
            </div>
        </footer>
    );
}
