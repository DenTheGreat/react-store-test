import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

type ProductCardProps = {
    product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            {product.image ? (
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 rounded"
                />
            ) : (
                <svg
                    className="w-full h-48 object-cover mb-4 rounded bg-gray-100 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 300 200"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <rect width="300" height="200" fill="currentColor" />
                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fill="white"
                        fontSize="20"
                        fontFamily="sans-serif"
                    >
                        No Image
                    </text>
                </svg>
            )}
            <h2 className="font-semibold text-xl mb-2">{product.name}</h2>
            <p className="text-gray-600 text-sm">{product.category}</p>
            <p className="font-bold text-lg mt-2">${product.price}</p>

            <Link
                to={`/product/${product.id}`}
                className="mt-4 inline-block text-blue-500 hover:underline"
            >
                View Details
            </Link>
        </div>
    )
}

export default ProductCard
