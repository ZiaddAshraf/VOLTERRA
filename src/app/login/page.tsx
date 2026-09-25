"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "");
        const password = String(form.get("password") ?? "");
        setIsSubmitting(true);
        setError("");
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
            setError("Email or password is incorrect.");
            setIsSubmitting(false);
            return;
        }
        router.push("/account");
    };

    return (
        <div className="mx-auto my-12 max-w-xl rounded-[30px] border border-black/5 bg-white p-8 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">Account</div>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.08em]">Login</h1>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Email</label>
                    <Input name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Password</label>
                    <Input name="password" type="password" minLength={8} required />
                </div>
                {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
                <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login"}</Button>
            </form>
            <p className="mt-5 text-sm text-zinc-600">
                Need an account? <Link href="/register" className="font-semibold text-[#d8452a]">Register</Link>
            </p>
        </div>
    );
}
