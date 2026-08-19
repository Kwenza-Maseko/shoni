import Avatar from "@/components/Avatar";
import Sidebar from "@/components/Sidebar";
import { ReactNode } from "react";


export default function ClientRoot({ children }: { children: ReactNode }) {
    return (
        <div className='flex'>
            <Sidebar />
            <div className='w-full px-6'>
                <Avatar />
                {children}
            </div>
        </div>
    );
}