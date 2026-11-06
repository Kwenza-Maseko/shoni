import Avatar from "@/components/Avatar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
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