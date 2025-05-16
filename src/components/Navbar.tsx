import { useSearch } from '../context/SearchContext'

export default function Navbar() {
    const { searchTerm, setSearchTerm } = useSearch()

    return (
        <nav className="w-full bg-white shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <a href="#" className="text-xl font-bold text-blue-600">
                SlavikStore
            </a>
            <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <div className="text-gray-600 whitespace-nowrap">🛒 Cart (0)</div>
        </nav>
    )
}
