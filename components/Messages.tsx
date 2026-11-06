'use client'
import { MessageCircleIcon } from 'lucide-react'
import { useState } from 'react'

const Messages = () => {
    const [open, setOpen] = useState(false)

    const COUNT_MESSAGES = 1 + 7
    return (
        <div className='relative'>
            <div className='relative ' onClick={() => setOpen((prev) => !prev)}>
                <MessageCircleIcon className="w-5" />
                <div className="absolute -top-1 px-1.5 bg-red-700 text-white -right-2.5 rounded">
                    <p className='text-[8pt]'>{COUNT_MESSAGES}</p>
                </div>
            </div>


            {open && (
                <div className='absolute bg-black inset-0 top-4'>
                    these are notifications
                </div>
            )}
        </div>
    )
}

export default Messages