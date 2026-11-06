import React from 'react'

const Footer = () => {
    return (
        <div className='text-white flex justify-between items-center mt-8 border-t border-slate-800 bg-slate-950 p-6'>
            <div className="flex gap-3 items-center">
                <p>@2026</p>
                <p className="text-md font-black">Shoni</p>
                <div className='w-1 h-1 bg-slate-600 rounded-full' />
                <div className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-light">
                    v1.0
                </div>
            </div>
            <div>
                <p>
                    Powered by <span className='text-blue-500'> ElsonifyTech</span>
                </p>
            </div>
        </div >
    )
}

export default Footer