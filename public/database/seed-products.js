const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the database directory exists
const dbDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'webshop.db');
const db = new sqlite3.Database(dbPath);

// Sample products data
const sampleProducts = [
    // Electronics
    {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life",
        price: 99.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        category: "Electronics",
        stock: 50
    },
    {
        name: "Smart Watch",
        description: "Advanced smartwatch with fitness tracking, heart rate monitor, and GPS",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
        category: "Electronics",
        stock: 30
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with excellent sound quality and waterproof design",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
        category: "Electronics",
        stock: 35
    },
    {
        name: "Gaming Mouse",
        description: "High-precision gaming mouse with RGB lighting and programmable buttons",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
        category: "Electronics",
        stock: 45
    },
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with tactile switches and customizable lighting",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
        category: "Electronics",
        stock: 25
    },
    {
        name: "Wireless Charger",
        description: "Fast wireless charging pad compatible with all Qi-enabled devices",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
        category: "Electronics",
        stock: 60
    },
    
    // Appliances
    {
        name: "Coffee Maker",
        description: "Automatic coffee maker with programmable features and thermal carafe",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop",
        category: "Appliances",
        stock: 25
    },
    {
        name: "Air Fryer",
        description: "Digital air fryer with 5.8L capacity and 8 cooking presets",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
        category: "Appliances",
        stock: 20
    },
    {
        name: "Blender",
        description: "High-speed blender with 6 blades for smoothies and food prep",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1585515655855-7635a7b4b8b8?w=300&h=300&fit=crop",
        category: "Appliances",
        stock: 30
    },
    {
        name: "Toaster",
        description: "4-slice toaster with bagel setting and defrost function",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=300&h=300&fit=crop",
        category: "Appliances",
        stock: 40
    },
    
    // Sports & Fitness
    {
        name: "Running Shoes",
        description: "Comfortable running shoes with advanced cushioning and breathable upper",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
        category: "Sports",
        stock: 40
    },
    {
        name: "Yoga Mat",
        description: "Premium yoga mat with excellent grip and cushioning for all poses",
        price: 34.99,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
        category: "Sports",
        stock: 55
    },
    {
        name: "Dumbbells Set",
        description: "Adjustable dumbbells set with multiple weight options for home gym",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
        category: "Sports",
        stock: 15
    },
    {
        name: "Basketball",
        description: "Official size basketball with premium leather construction",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop",
        category: "Sports",
        stock: 35
    },
    
    // Accessories
    {
        name: "Laptop Stand",
        description: "Adjustable aluminum laptop stand for better ergonomics and cooling",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
        category: "Accessories",
        stock: 60
    },
    {
        name: "Phone Case",
        description: "Protective phone case with shock absorption and wireless charging support",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
        category: "Accessories",
        stock: 100
    },
    {
        name: "Laptop Bag",
        description: "Professional laptop bag with multiple compartments and padded protection",
        price: 69.99,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a5c?w=300&h=300&fit=crop",
        category: "Accessories",
        stock: 25
    },
    {
        name: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness and color temperature",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
        category: "Accessories",
        stock: 45
    },
    
    // Books
    {
        name: "Programming Book",
        description: "Complete guide to modern web development with practical examples",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop",
        category: "Books",
        stock: 20
    },
    {
        name: "Cookbook",
        description: "Healthy cooking recipes with step-by-step instructions and photos",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop",
        category: "Books",
        stock: 30
    },
    {
        name: "Fiction Novel",
        description: "Bestselling mystery thriller with captivating plot and characters",
        price: 14.99,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
        category: "Books",
        stock: 50
    },
    
    // Home & Kitchen
    {
        name: "Kitchen Knife Set",
        description: "Professional chef knife set with wooden block and sharpening steel",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
        category: "Home",
        stock: 20
    },
    {
        name: "Throw Pillows",
        description: "Set of 4 decorative throw pillows with soft velvet covers",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        category: "Home",
        stock: 40
    },
    {
        name: "Candles Set",
        description: "Scented candles set with natural soy wax and wooden wicks",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop",
        category: "Home",
        stock: 35
    },
    
    // Clothing
    {
        name: "Hoodie",
        description: "Comfortable cotton hoodie with kangaroo pocket and drawstring hood",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a8?w=300&h=300&fit=crop",
        category: "Clothing",
        stock: 30
    },
    {
        name: "T-Shirt",
        description: "Premium cotton t-shirt with soft fabric and modern fit",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
        category: "Clothing",
        stock: 75
    },
    {
        name: "Jeans",
        description: "Classic denim jeans with stretch fabric and modern cut",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
        category: "Clothing",
        stock: 25
    }
];

// Insert sample products
db.serialize(() => {
    // Clear existing products
    db.run('DELETE FROM products');
    
    // Insert sample products
    const stmt = db.prepare(`
        INSERT INTO products (name, description, price, image, category, stock)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    sampleProducts.forEach(product => {
        stmt.run([
            product.name,
            product.description,
            product.price,
            product.image,
            product.category,
            product.stock
        ]);
    });
    
    stmt.finalize();
    
    console.log('Sample products inserted successfully!');
    
    // Verify insertion
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            console.error('Error fetching products:', err);
        } else {
            console.log(`Total products in database: ${rows.length}`);
            rows.forEach(product => {
                console.log(`- ${product.name}: $${product.price}`);
            });
        }
        
        db.close();
    });
});
