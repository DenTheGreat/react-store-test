import { useCallback, useRef, useState } from 'react'
import { fetchProducts } from '../api/api'
import type { Product } from '../types/product'

interface UseProductLoaderProps {
    searchTerm: string
    limit?: number
}

interface UseProductLoaderReturn {
    loading: boolean
    hasMoreDown: boolean
    hasMoreUp: boolean
    allItems: Map<number, Product>
    totalItemsKnown: number
    fetchProductData: (offset: number, direction?: 'up' | 'down' | 'initial') => Promise<void>
    resetData: () => void
}

export const useProductLoader = ({
                                     searchTerm,
                                     limit = 40
                                 }: UseProductLoaderProps): UseProductLoaderReturn => {
    const [loading, setLoading] = useState(false)
    const [hasMoreDown, setHasMoreDown] = useState(true)
    const [hasMoreUp, setHasMoreUp] = useState(false)
    const [allItems, setAllItems] = useState<Map<number, Product>>(new Map())
    const [totalItemsKnown, setTotalItemsKnown] = useState(0)

    const loadingRef = useRef(false)

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
        [searchTerm, limit]
    )

    const resetData = useCallback(() => {
        setAllItems(new Map())
        setHasMoreDown(true)
        setHasMoreUp(false)
        setTotalItemsKnown(0)
        loadingRef.current = false
    }, [])

    return {
        loading,
        hasMoreDown,
        hasMoreUp,
        allItems,
        totalItemsKnown,
        fetchProductData,
        resetData
    }
}