import { useEffect } from 'react'
import ProductCard from './ProductCard'
import { useSearch } from '../context/SearchContext'
import { useProductLoader } from '../hooks/useProductLoader'
import { useVirtualScroll } from '../hooks/useVirtualScroll'
import {useVisibleItems} from "../hooks/useVIsibleItems.ts";

const ProductList = () => {
    const { searchTerm } = useSearch()

    const limit = 40
    const itemsPerRow = 5
    const rowHeight = 280
    const overscan = 5

    // Product loading logic
    const {
        loading,
        hasMoreDown,
        hasMoreUp,
        allItems,
        totalItemsKnown,
        fetchProductData,
        resetData
    } = useProductLoader({ searchTerm, limit })

    // Virtual scrolling logic
    const {
        visibleRange,
        containerRef,
        scrollElementRef,
        paddingTop,
        paddingBottom,
        resetScroll
    } = useVirtualScroll({
        totalItemsKnown,
        itemsPerRow,
        rowHeight,
        overscan,
        limit,
        onLoadMore: fetchProductData,
        hasMoreDown,
        hasMoreUp,
        allItems
    })

    // Visible items calculation
    const { visibleItems } = useVisibleItems({
        visibleRange,
        allItems
    })

    // Reset on search term change
    useEffect(() => {
        resetData()
        resetScroll()
        fetchProductData(0, 'initial')
    }, [searchTerm, resetData, resetScroll, fetchProductData])

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
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
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