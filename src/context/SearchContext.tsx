import { createContext, useContext, useState } from 'react'

export const SearchContext = createContext<{
    searchTerm: string
    setSearchTerm: (value: string) => void
}>({
    searchTerm: '',
    setSearchTerm: () => {},
})

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [searchTerm, setSearchTerm] = useState('')
    return (
        <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
            {children}
        </SearchContext.Provider>
    )
}

export const useSearch = () => useContext(SearchContext)
