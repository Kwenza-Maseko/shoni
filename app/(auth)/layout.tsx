import { ReactNode } from 'react'

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <main className='min-h-screen flex items-center flex-col justify-center '>
            <div className=' w-full md:w-100'>
                <div className="flex flex-col gap-4 items-center pb-8">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default AuthLayout;