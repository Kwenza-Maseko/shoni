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

    const [protectionCode, setProtectionCode] = useState("");
    const [loading, setLoading] = useState(false);

    const page = searchParams.get("next");


    async function handleUnlock(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/settings/unlock", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    page,
                    protectionCode,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Unable to unlock page");
                return;
            }

            // The API response has now set the unlock cookie.
            router.replace(data.redirectTo);
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

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


                <form onSubmit={handleUnlock} className="space-y-3">
                    <Input
                        type="password"
                        value={protectionCode}
                        onChange={(event) =>
                            setProtectionCode(event.target.value)
                        }
                        autoFocus
                        placeholder="Enter protection code"
                        required
                    />

                    {error && <p className="text-red-500">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Unlocking..." : "Unlock Page"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default UnlockForm;