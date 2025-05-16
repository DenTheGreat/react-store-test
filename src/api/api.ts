const API_URL = 'http://localhost:3000'

export const fetchProducts = async (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`http://localhost:3000/products?${query}`)
    if (!response.ok) throw new Error('Failed to fetch products')
    return await response.json()
}

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/categories`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
    }
}

export const fetchSubcategories = async (category: string) => {
    try {
        const response = await fetch(`${API_URL}/subcategories?category=${category}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching subcategories:', error)
        throw error
    }
}

export const fetchProductById = async (id: string) => {
    const response = await fetch(`http://localhost:3000/products/${id}`)
    if (!response.ok) {
        throw new Error('Product not found')
    }
    const product = await response.json()
    return product
}

