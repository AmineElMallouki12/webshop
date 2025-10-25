// Script to add sample products to the database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'data', 'webshop.db');
const db = new sqlite3.Database(dbPath);

// Sample products data
const sampleProducts = [
    {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 99.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 50
    },
    {
        name: "Smart Watch",
        description: "Advanced smartwatch with health monitoring features",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 25
    },
    {
        name: "Laptop Stand",
        description: "Adjustable laptop stand for better ergonomics",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 100
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with excellent sound quality",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 75
    },
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard for gaming and typing",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 30
    },
    {
        name: "Gaming Mouse",
        description: "High-precision gaming mouse with customizable buttons",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 40
    }
];

// Function to add products
function addSampleProducts() {
    console.log('Adding sample products to database...');
    
    sampleProducts.forEach((product, index) => {
        const stmt = db.prepare(`
            INSERT INTO products (name, description, price, image, category, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run([
            product.name,
            product.description,
            product.price,
            product.image,
            product.category,
            product.stock
        ], function(err) {
            if (err) {
                console.error(`Error adding product ${product.name}:`, err);
            } else {
                console.log(`✅ Added: ${product.name} (ID: ${this.lastID})`);
            }
        });
    });
    
    console.log('Sample products added successfully!');
    db.close();
}

// Run the script
addSampleProducts();
