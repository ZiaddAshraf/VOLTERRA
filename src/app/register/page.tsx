"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") ?? "");
        const email = String(form.get("email") ?? "");
        const phone = String(form.get("phone") ?? "");
        const password = String(form.get("password") ?? "");
        setIsSubmitting(true);
        setError("");
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, password }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) {
            setError(result?.error ?? "We could not create your account.");
            setIsSubmitting(false);
            return;
        }
        const loginResult = await signIn("credentials", { email, password, redirect: false });
        if (loginResult?.error) {
            setError("Account created. Please sign in to continue.");
            setIsSubmitting(false);
            return;
        }
        router.push("/account");
    };

    return (
        <div className="mx-auto my-12 max-w-xl rounded-[30px] border border-black/5 bg-white p-8 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">Create account</div>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.08em]">Register</h1>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Name</label>
                    <Input name="name" placeholder="Your name" required />
                </div>
                <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Email</label>
                    <Input name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Phone</label>
                    <Input name="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">Password</label>
                    <Input name="password" type="password" minLength={8} required />
                </div>
                {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
                <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</Button>
            </form>
            <p className="mt-5 text-sm text-zinc-600">
                Already have an account? <Link href="/login" className="font-semibold text-[#d8452a]">Login</Link>
            </p>
        </div>
    );
}
