"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const UnlockForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/settings";

    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!code.trim()) {
            setError("Enter the protection code.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/settings/unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ page: next, protectionCode: code }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data?.message || "Incorrect protection code");
            }

            router.push(next);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                        <Lock className="w-5 h-5 text-zinc-700" />
                    </div>
                    <h1 className="text-lg font-semibold text-zinc-900">Protected page</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Enter the protection code to continue to{" "}
                        <span className="font-mono text-zinc-700">{next}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Protection code"
                        autoFocus
                    />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Verifying..." : "Unlock"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default UnlockForm;