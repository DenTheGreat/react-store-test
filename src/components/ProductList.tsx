import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchProducts } from '../api/api'
import type { Product } from '../types/product'
import ProductCard from './ProductCard'
import { useSearch } from '../context/SearchContext'

const ProductList = () => {
    const { searchTerm } = useSearch()
    const [loading, setLoading] = useState(false)
    const [hasMoreDown, setHasMoreDown] = useState(true)
    const [hasMoreUp, setHasMoreUp] = useState(false)

    // All loaded items stored by their global index
    const [allItems, setAllItems] = useState<Map<number, Product>>(new Map())
    const [totalItemsKnown, setTotalItemsKnown] = useState(0)

    // Virtualization state
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 40 })
    const [scrollTop, setScrollTop] = useState(0)

    const limit = 40
    const itemsPerRow = 5
    const estimatedItemHeight = 280 // Estimated height per item for calculations
    const rowHeight = estimatedItemHeight // Height per row
    const overscan = 5 // Extra rows to render outside viewport

    const loadingRef = useRef(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollElementRef = useRef<HTMLDivElement>(null)
    const itemHeightsRef = useRef<Map<number, number>>(new Map())

    const fetchProductData = useCallback(
        async (offset: number, direction: 'up' | 'down' | 'initial' = 'down') => {
            if (loadingRef.current || offset < 0) return

            loadingRef.current = true
            setLoading(true)

            try {
                const params = {
                    limit: limit.toString(),
                    offset: offset.toString(),
                    search: searchTerm
                }

                const data = await fetchProducts(params)
                const newProducts = data.products

                if (newProducts.length === 0) {
                    if (direction === 'down') setHasMoreDown(false)
                    if (direction === 'up') setHasMoreUp(false)
                    return
                }

                // Update items map
                setAllItems(prev => {
                    const newMap = new Map(prev)
                    newProducts.forEach((product, index) => {
                        newMap.set(offset + index, product)
                    })
                    return newMap
                })

                // Update pagination state
                if (direction === 'initial') {
                    setHasMoreDown(newProducts.length === limit)
                    setHasMoreUp(offset > 0)
                    setTotalItemsKnown(offset + newProducts.length)
                } else if (direction === 'down') {
                    setHasMoreDown(newProducts.length === limit)
                    setTotalItemsKnown(prev => Math.max(prev, offset + newProducts.length))
                } else if (direction === 'up') {
                    setHasMoreUp(offset > 0)
                }

            } catch (err) {
                console.error('Error fetching products:', err)
                if (direction === 'down') setHasMoreDown(false)
                if (direction === 'up') setHasMoreUp(false)
            } finally {
                setLoading(false)
                loadingRef.current = false
            }
        },
        [searchTerm]
    )

    // Calculate which items should be visible based on scroll position
    const calculateVisibleRange = useCallback(() => {
        if (!containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const scrollTop = window.scrollY
        const viewportHeight = window.innerHeight

        // Calculate which rows are visible
        const containerTop = containerRect.top + scrollTop
        const startRow = Math.max(0, Math.floor((scrollTop - containerTop) / rowHeight) - overscan)
        const endRow = Math.ceil((scrollTop + viewportHeight - containerTop) / rowHeight) + overscan

        const startIndex = startRow * itemsPerRow
        const endIndex = Math.min((endRow + 1) * itemsPerRow, totalItemsKnown + limit)

        return { start: startIndex, end: endIndex }
    }, [totalItemsKnown, rowHeight, itemsPerRow, overscan])

    // Update visible range on scroll
    const handleScroll = useCallback(() => {
        const newScrollTop = window.scrollY
        setScrollTop(newScrollTop)

        const newRange = calculateVisibleRange()
        if (newRange) {
            setVisibleRange(newRange)

            // Check if we need to load more data
            const threshold = limit / 2

            // Load more down
            if (hasMoreDown && newRange.end >= totalItemsKnown - threshold) {
                fetchProductData(totalItemsKnown, 'down')
            }

            // Load more up
            if (hasMoreUp && newRange.start <= threshold) {
                const loadStart = Math.max(0, newRange.start - limit)
                if (!allItems.has(loadStart)) {
                    fetchProductData(loadStart, 'up')
                }
            }
        }
    }, [calculateVisibleRange, hasMoreDown, hasMoreUp, totalItemsKnown, allItems, fetchProductData])

    // Reset on search
    useEffect(() => {
        setAllItems(new Map())
        setHasMoreDown(true)
        setHasMoreUp(false)
        setTotalItemsKnown(0)
        setVisibleRange({ start: 0, end: 40 })
        setScrollTop(0)
        fetchProductData(0, 'initial')
    }, [searchTerm])

    // Set up scroll listener
    useEffect(() => {
        const throttledHandleScroll = (() => {
            let ticking = false
            return () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        handleScroll()
                        ticking = false
                    })
                    ticking = true
                }
            }
        })()

        window.addEventListener('scroll', throttledHandleScroll, { passive: true })

        // Initial calculation
        setTimeout(() => handleScroll(), 100)

        return () => window.removeEventListener('scroll', throttledHandleScroll)
    }, [handleScroll])

    // Get visible items for current range
    const getVisibleItems = () => {
        const items: { product: Product; index: number }[] = []
        for (let i = visibleRange.start; i < visibleRange.end; i++) {
            const product = allItems.get(i)
            if (product) {
                items.push({ product, index: i })
            }
        }
        return items
    }

    const visibleItems = getVisibleItems()

    // Calculate padding to maintain scroll position
    const totalRows = Math.ceil(totalItemsKnown / itemsPerRow)
    const visibleStartRow = Math.floor(visibleRange.start / itemsPerRow)
    const visibleEndRow = Math.ceil(visibleRange.end / itemsPerRow)

    const paddingTop = visibleStartRow * rowHeight
    const paddingBottom = Math.max(0, (totalRows - visibleEndRow) * rowHeight)

    return (
        <div className="container mx-auto p-4" ref={containerRef}>
            <div
                ref={scrollElementRef}
                style={{
                    paddingTop: `${paddingTop}px`,
                    paddingBottom: `${paddingBottom}px`,
                    minHeight: loading && visibleItems.length === 0 ? '400px' : 'auto'
                }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {visibleItems.map(({ product, index }) => (
                        <ProductCard
                            key={`${index}-${product.id}`}
                            product={product}
                        />
                    ))}
                </div>

                {loading && (
                    <div className="text-center mt-8 mb-8">
                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductList