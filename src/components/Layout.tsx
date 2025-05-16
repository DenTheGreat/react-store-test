import type {ReactNode} from 'react'
import Navbar from './Navbar'

type Props = {
    children: ReactNode
}

export default function Layout({ children }: Props) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 p-4 bg-gray-50">
                {children}
            </main>
        </div>
    )
}
