import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const useDatabaseAuth = Boolean(process.env.DATABASE_URL);

export const authOptions: NextAuthOptions = {
    adapter: useDatabaseAuth ? PrismaAdapter(prisma) : undefined,
    session: { strategy: useDatabaseAuth ? "database" : "jwt" },
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
        }),
        CredentialsProvider({
            name: "Email and password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = credentialsSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
                if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;

                return { id: user.id, name: user.name, email: user.email, role: user.role };
            },
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                const databaseUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { role: true },
                });
                session.user.role = databaseUser?.role ?? "USER";
            }
            return session;
        },
    },
    pages: { signIn: "/login" },
    secret: process.env.AUTH_SECRET,
};
