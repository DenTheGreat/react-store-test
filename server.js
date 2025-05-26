const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Generate 10,000 products once when server starts
const generateProducts = () => {
  const categories = [
    'Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Toys',
    'Sports', 'Beauty', 'Health', 'Automotive', 'Grocery'
  ];
  
  const adjectives = [
    'Premium', 'Deluxe', 'Ultimate', 'Essential', 'Professional',
    'Classic', 'Modern', 'Elegant', 'Luxury', 'Budget', 'Compact',
    'Portable', 'Wireless', 'Smart', 'Eco-friendly', 'Vintage'
  ];
  
  const nouns = [
    'Device', 'Tool', 'Set', 'Kit', 'Pack', 'Collection', 'System',
    'Solution', 'Bundle', 'Package', 'Box', 'Accessory', 'Component'
  ];

  const products = [];
  
  for (let i = 1; i <= 10000; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const subcategory = `${category} ${Math.floor(Math.random() * 5) + 1}`;
    
    products.push({
      id: uuidv4(),
      name: `${adjective} ${category} ${noun} ${i}`,
      price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      category: category,
      subcategory: subcategory,
      stock: Math.floor(Math.random() * 100),
      rating: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
    });
  }
  
  return products;
};

const products = generateProducts();

// GET /products endpoint with filtering, sorting, limit and offset
app.get('/products', (req, res) => {
  try {
    // Extract query parameters
    const { 
      limit = 10, 
      offset = 0, 
      sort = 'name', 
      order = 'asc',
      category,
      subcategory,
      minPrice,
      maxPrice,
      minRating,
      search
    } = req.query;

    // Convert parameters to the right type
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const minPriceNum = minPrice ? parseFloat(minPrice) : null;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : null;
    const minRatingNum = minRating ? parseFloat(minRating) : null;

    // Filter products
    let filteredProducts = [...products];
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    if (subcategory) {
      filteredProducts = filteredProducts.filter(p => p.subcategory.toLowerCase() === subcategory.toLowerCase());
    }
    
    if (minPriceNum !== null) {
      filteredProducts = filteredProducts.filter(p => p.price >= minPriceNum);
    }
    
    if (maxPriceNum !== null) {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPriceNum);
    }
    
    if (minRatingNum !== null) {
      filteredProducts = filteredProducts.filter(p => p.rating >= minRatingNum);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort products
    filteredProducts.sort((a, b) => {
      const sortOrder = order.toLowerCase() === 'desc' ? -1 : 1;
      
      if (a[sort] < b[sort]) return -1 * sortOrder;
      if (a[sort] > b[sort]) return 1 * sortOrder;
      return 0;
    });
    
    // Apply pagination
    const paginatedProducts = filteredProducts.slice(offsetNum, offsetNum + limitNum);
    
    // Send response
    res.json({
      total: filteredProducts.length,
      limit: limitNum,
      offset: offsetNum,
      products: paginatedProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /products/:id endpoint to get a single product by ID
app.get('/products/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET available categories
app.get('/categories', (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET available subcategories (optionally filtered by category)
app.get('/subcategories', (req, res) => {
  try {
    const { category } = req.query;
    let filteredProducts = products;
    
    if (category) {
      filteredProducts = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    const subcategories = [...new Set(filteredProducts.map(p => p.subcategory))];
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Generated ${products.length} products`);
});
