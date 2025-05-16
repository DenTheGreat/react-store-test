import { useEffect, useState } from 'react'
import { fetchProducts } from '../api/api'
import type { Product } from '../types/product'
import ProductCard from './ProductCard'
import { useSearch } from '../context/SearchContext'

const ProductList = () => {
    const { searchTerm } = useSearch()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const fetchProductData = async (reset = false) => {
        if (loading || (!hasMore && !reset)) return
        setLoading(true)

        try {
            const params = {
                limit: '20',
                offset: reset ? '0' : offset.toString(),
                search: searchTerm,
            }

            const data = await fetchProducts(params)
            setProducts((prev) =>
                reset ? data.products : [...prev, ...data.products]
            )
            setOffset((prev) => (reset ? 20 : prev + 20))
            setHasMore(data.products.length === 20)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch when searchTerm changes
    useEffect(() => {
        setOffset(0)
        setHasMore(true)
        fetchProductData(true) // reset products
    }, [fetchProductData, searchTerm])

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (loading || !hasMore) return
            const scrollY = window.scrollY
            const windowHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight
            if (scrollY + windowHeight >= fullHeight - 100) {
                fetchProductData()
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [offset, loading, hasMore, fetchProductData])

    return (
        <>
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {loading && (
                        <div className="col-span-full text-center">Loading...</div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProductList
