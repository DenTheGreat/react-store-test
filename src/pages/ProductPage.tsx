import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchProductById } from '../api/api' // Assuming you've already created this function

// Type for product data
export type Product = {
    id: string
    name: string
    description: string
    price: number
    category: string
    image: string
}

const ProductPage = () => {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    // Fetch the product data by ID
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const data = await fetchProductById(id!) // Ensure 'id' is passed correctly
                setProduct(data)
            } catch (error) {
                console.error('Error fetching product:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) return <div className="p-4">Loading...</div>
    if (!product) return <div className="p-4">Product not found</div>

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-semibold mb-4">{product.name}</h1>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2">
                    <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-96 object-cover rounded-lg mb-4"
                    />
                </div>
                <div className="w-full lg:w-1/2">
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p>{product.description}</p>
                    <p className="mt-4 text-lg font-bold">${product.price.toFixed(2)}</p>
                    <p className="mt-2 text-gray-500">Category: {product.category}</p>
                </div>
            </div>
        </div>
    )
}

export default ProductPage
