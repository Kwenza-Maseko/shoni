import Avatar from "@/components/Avatar";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

export default function ClientRoot({ children }: { children: ReactNode }) {
    return (
        <div>
            <div className='w-full px-6'>
                <Avatar />
                {children}
            </div>

            <Footer />
        </div>
    );
}