'use client'
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import {
    PanelRightIcon,
    PanelLeftIcon
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react'

import { usePathname } from 'next/navigation'

const Sidebar = () => {
    const [isOpened, setIsOpened] = useState(true);
    const pathname = usePathname();

    const toogle = () => setIsOpened((prev) => !prev)
    return (
        <div className='relative'>
            <div className="absolute right-2 top-3.5" onClick={toogle}>
                {isOpened ? (
                    <PanelRightIcon className='w-4 h-4' />
                ) : (
                    <PanelLeftIcon className='w-4 h-4' />
                )}
            </div>

            <div className={`${isOpened == true ? "w-64" : "w-12"} overflow-x-hidden min-h-screen bg-zinc-50 p-2`}>
                {isOpened ?
                    <p className='text-lg font-black'>Shoni</p>: <p className='text-lg font-black'>S</p>}

                <div className="mt-16 rounded-lg w-full h-full">
                    {sidebarLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.id}
                                href={item.url}
                                aria-current={pathname.startsWith(item.url) ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-2 mb-1 capitalize transition-colors p-2 rounded-md w-full ",
                                    pathname === item.url
                                        ? "bg-black font-bold text-white"
                                        : "text-black hover:text-gray-500"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {isOpened && (
                                    <p className='capitalize'>{item.name}</p>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Sidebar