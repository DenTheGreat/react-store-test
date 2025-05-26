import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchProducts } from '../api/api'
import type { Product } from '../types/product'
import ProductCard from './ProductCard'
import { useSearch } from '../context/SearchContext'

const ProductList = () => {
    const { searchTerm } = useSearch()

    const [products, setProducts] = useState<Product[]>([])
    const [startIndex, setStartIndex] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [totalItemsLoaded, setTotalItemsLoaded] = useState(0)

    const limit = 40
    const overlap = 20
    const itemHeight = 300
    const itemsPerRow = 5

    const loadingRef = useRef(false)

    const fetchProductData = useCallback(
        async (start: number) => {
            if (loadingRef.current) return
            loadingRef.current = true
            setLoading(true)

            try {
                const params = {
                    limit: limit.toString(),
                    offset: start.toString(),
                    search: searchTerm
                }

                const data = await fetchProducts(params)
                setProducts(data.products)
                setStartIndex(start)
                setHasMore(data.products.length === limit)
                setTotalItemsLoaded((prev) =>
                    start + data.products.length > prev ? start + data.products.length : prev
                )
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
                loadingRef.current = false
            }
        },
        [searchTerm]
    )

    // Reset on search
    useEffect(() => {
        setStartIndex(0)
        setHasMore(true)
        setTotalItemsLoaded(0)
        fetchProductData(0)
    }, [fetchProductData, searchTerm])

    // Scroll trigger
    useEffect(() => {
        const onScroll = () => {
            if (loading || !hasMore) return

            const scrollY = window.scrollY
            const windowHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight

            if (scrollY + windowHeight >= fullHeight - 100) {
                fetchProductData(startIndex + overlap)
            }
        }

        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [fetchProductData, startIndex, hasMore, loading])

    const paddingTop = (startIndex / itemsPerRow) * itemHeight
    const paddingBottom =
        ((Math.max(totalItemsLoaded - startIndex - products.length, 0)) / itemsPerRow) *
        itemHeight

    return (
        <div className="container mx-auto p-4">
            <div style={{ paddingTop, paddingBottom }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {loading && (
                    <div className="col-span-full text-center mt-4">Loading...</div>
                )}
            </div>
        </div>
    )
}

export default ProductList
