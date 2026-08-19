"use client";

import Avatar from "@/components/Avatar";
import Sidebar from "@/components/Sidebar";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export default function ClientRoot({
    children,
}: {
    children: ReactNode;
}) {
    const [isOpened, setIsOpened] = useState(true);

    return (
        <div className="min-h-screen">
            <Sidebar
                isOpened={isOpened}
                setIsOpened={setIsOpened}
            />

            <main
                className={cn(
                    "min-h-screen px-6 transition-all duration-300",
                    isOpened ? "ml-64" : "ml-12"
                )}
            >
                <Avatar />
                {children}
            </main>
        </div>
    );
}