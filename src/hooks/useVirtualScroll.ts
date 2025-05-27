import { useCallback, useEffect, useRef, useState } from 'react'

interface UseVirtualScrollProps {
    totalItemsKnown: number
    itemsPerRow?: number
    rowHeight?: number
    overscan?: number
    limit?: number
    onLoadMore?: (offset: number, direction: 'up' | 'down') => void
    hasMoreDown?: boolean
    hasMoreUp?: boolean
    allItems?: Map<number, any>
}

interface UseVirtualScrollReturn {
    visibleRange: { start: number; end: number }
    scrollTop: number
    containerRef: React.RefObject<HTMLDivElement>
    scrollElementRef: React.RefObject<HTMLDivElement>
    paddingTop: number
    paddingBottom: number
    resetScroll: () => void
}

export const useVirtualScroll = ({
                                     totalItemsKnown,
                                     itemsPerRow = 5,
                                     rowHeight = 280,
                                     overscan = 5,
                                     limit = 40,
                                     onLoadMore,
                                     hasMoreDown = true,
                                     hasMoreUp = false,
                                     allItems = new Map()
                                 }: UseVirtualScrollProps): UseVirtualScrollReturn => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 40 })
    const [scrollTop, setScrollTop] = useState(0)

    const containerRef = useRef<HTMLDivElement>(null)
    const scrollElementRef = useRef<HTMLDivElement>(null)

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
    }, [totalItemsKnown, rowHeight, itemsPerRow, overscan, limit])

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
            if (hasMoreDown && newRange.end >= totalItemsKnown - threshold && onLoadMore) {
                onLoadMore(totalItemsKnown, 'down')
            }

            // Load more up
            if (hasMoreUp && newRange.start <= threshold && onLoadMore) {
                const loadStart = Math.max(0, newRange.start - limit)
                if (!allItems.has(loadStart)) {
                    onLoadMore(loadStart, 'up')
                }
            }
        }
    }, [calculateVisibleRange, hasMoreDown, hasMoreUp, totalItemsKnown, allItems, onLoadMore, limit])

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

    const resetScroll = useCallback(() => {
        setVisibleRange({ start: 0, end: 40 })
        setScrollTop(0)
        window.scrollTo(0, 0)
    }, [])

    // Calculate padding to maintain scroll position
    const totalRows = Math.ceil(totalItemsKnown / itemsPerRow)
    const visibleStartRow = Math.floor(visibleRange.start / itemsPerRow)
    const visibleEndRow = Math.ceil(visibleRange.end / itemsPerRow)

    const paddingTop = visibleStartRow * rowHeight
    const paddingBottom = Math.max(0, (totalRows - visibleEndRow) * rowHeight)

    return {
        visibleRange,
        scrollTop,
        containerRef,
        scrollElementRef,
        paddingTop,
        paddingBottom,
        resetScroll
    }
}