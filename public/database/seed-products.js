const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'data', 'webshop.db');
const db = new sqlite3.Database(dbPath);

// Sample products data - MORE PRODUCTS ADDED!
const sampleProducts = [
    {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life",
        price: 99.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 50
    },
    {
        name: "Smart Watch",
        description: "Advanced smartwatch with health monitoring, GPS, and water resistance",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 25
    },
    {
        name: "Laptop Stand",
        description: "Adjustable aluminum laptop stand for better ergonomics and cooling",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 100
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with 360-degree sound and 12-hour battery",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 75
    },
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with Cherry MX switches for gaming and typing",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 30
    },
    {
        name: "Gaming Mouse",
        description: "High-precision gaming mouse with customizable buttons and RGB lighting",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 40
    },
    {
        name: "USB-C Hub",
        description: "7-in-1 USB-C hub with HDMI, USB ports, and SD card reader",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 60
    },
    {
        name: "Wireless Charger",
        description: "Fast wireless charging pad with LED indicator and anti-slip design",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 80
    },
    {
        name: "Monitor Stand",
        description: "Adjustable monitor stand with cable management and storage drawer",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 35
    },
    {
        name: "Webcam",
        description: "4K webcam with auto-focus, noise cancellation, and privacy shutter",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 20
    },
    {
        name: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness, color temperature, and USB charging",
        price: 69.99,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
        category: "Accessories",
        stock: 45
    },
    {
        name: "Power Bank",
        description: "20000mAh power bank with fast charging and multiple ports",
        price: 45.99,
        image: "https://images.unsplash.com/photo-1609592808260-4a4a4a4a4a4a?w=300&h=200&fit=crop",
        category: "Electronics",
        stock: 65
    }
];

// Function to clear existing products and add new ones
function seedProducts() {
    console.log('Seeding products to database...');
    
    // First, clear existing products
    db.run('DELETE FROM products', (err) => {
        if (err) {
            console.error('Error clearing products:', err);
        } else {
            console.log('✅ Cleared existing products');
        }
    });
    
    // Add sample products
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
    
    console.log('✅ All products seeded successfully!');
    
    // Close database after a short delay
    setTimeout(() => {
        db.close();
    }, 1000);
}

// Run the seeding
seedProducts();