import { useMemo } from 'react'
import type { Product } from '../types/product'

interface UseVisibleItemsProps {
    visibleRange: { start: number; end: number }
    allItems: Map<number, Product>
}

interface VisibleItem {
    product: Product
    index: number
}

interface UseVisibleItemsReturn {
    visibleItems: VisibleItem[]
}

export const useVisibleItems = ({
                                    visibleRange,
                                    allItems
                                }: UseVisibleItemsProps): UseVisibleItemsReturn => {
    const visibleItems = useMemo(() => {
        const items: VisibleItem[] = []
        for (let i = visibleRange.start; i < visibleRange.end; i++) {
            const product = allItems.get(i)
            if (product) {
                items.push({ product, index: i })
            }
        }
        return items
    }, [visibleRange, allItems])

    return {
        visibleItems
    }
}