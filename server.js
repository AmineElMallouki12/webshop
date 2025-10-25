require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dataDir, 'webshop.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

// Create tables if they don't exist
const createTables = `
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT,
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES cart(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    
    CREATE TABLE IF NOT EXISTS admin_credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

db.serialize(() => {
    db.exec(createTables, (err) => {
        if (err) {
            console.error('Error creating tables:', err);
        } else {
            console.log('Database tables created successfully');
        }
    });
    
    // Initialize default admin credentials if they don't exist
    db.get('SELECT COUNT(*) as count FROM admin_credentials', (err, row) => {
        if (err) {
            console.error('Error checking admin credentials:', err);
        } else if (row.count === 0) {
            // Insert default admin credentials
            const crypto = require('crypto');
            const defaultPassword = crypto.createHash('sha256').update('admin123').digest('hex');
            
            db.run('INSERT INTO admin_credentials (username, password) VALUES (?, ?)', 
                ['admin', defaultPassword], (err) => {
                if (err) {
                    console.error('Error inserting default admin credentials:', err);
                } else {
                    console.log('Default admin credentials created (username: admin, password: admin123)');
                }
            });
        }
    });
});

// Simple database service
const dbService = {
    getProducts: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM products', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    getProductById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    getOrCreateCart: (sessionId) => {
        return new Promise((resolve, reject) => {
            // Ensure sessionId is not undefined
            if (!sessionId || sessionId === 'undefined') {
                sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
                console.log('Generated fallback session ID:', sessionId);
            }
            
            console.log('Creating/getting cart for session:', sessionId);
            
            db.get('SELECT * FROM cart WHERE session_id = ?', [sessionId], (err, row) => {
                if (err) {
                    console.error('Error querying cart:', err);
                    return reject(err);
                }
                if (row) {
                    console.log('Found existing cart:', row);
                    return resolve(row);
                }
                
                console.log('Creating new cart for session:', sessionId);
                db.run('INSERT INTO cart (session_id) VALUES (?)', [sessionId], function(err) {
                    if (err) {
                        console.error('Error creating cart:', err);
                        return reject(err);
                    }
                    console.log('Created new cart with ID:', this.lastID);
                    resolve({ id: this.lastID, session_id: sessionId });
                });
            });
        });
    },
    getCartItems: (cartId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT ci.*, p.name, p.image, p.price as product_price 
                 FROM cart_items ci 
                 JOIN products p ON ci.product_id = p.id 
                 WHERE ci.cart_id = ?`,
                [cartId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },
    addToCart: (cartId, productId, quantity = 1) => {
        return new Promise((resolve, reject) => {
            // First get the product price
            db.get('SELECT price FROM products WHERE id = ?', [productId], (err, product) => {
                if (err) return reject(err);
                if (!product) return reject(new Error('Product not found'));
                
                // Check if item is already in cart
                db.get('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', 
                    [cartId, productId], 
                    (err, existingItem) => {
                        if (err) return reject(err);
                        
                        if (existingItem) {
                            // Update quantity
                            const newQuantity = existingItem.quantity + quantity;
                            db.run(
                                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                                [newQuantity, existingItem.id],
                                function(err) {
                                    if (err) return reject(err);
                                    resolve({ ...existingItem, quantity: newQuantity });
                                }
                            );
                        } else {
                            // Add new item
                            db.run(
                                'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                                [cartId, productId, quantity, product.price],
                                function(err) {
                                    if (err) return reject(err);
                                    resolve({
                                        id: this.lastID,
                                        cart_id: cartId,
                                        product_id: productId,
                                        quantity,
                                        price: product.price
                                    });
                                }
                            );
                        }
                    }
                );
            });
        });
    },
    updateCartItem: (cartId, productId, quantity) => {
        if (quantity <= 0) {
            return dbService.removeFromCart(cartId, productId);
        }
        
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
                [quantity, cartId, productId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    },
    removeFromCart: (cartId, productId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cartId, productId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    }
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve admin files from the public/admin directory
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Serve CSS files
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));

// Serve JavaScript files
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// API routes will be mounted here
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Hash the provided password
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Check credentials against database
    db.get('SELECT * FROM admin_credentials WHERE username = ? AND password = ?', 
        [username, hashedPassword], (err, row) => {
        if (err) {
            console.error('Database error during authentication:', err);
            return res.status(500).json({ error: 'Authentication error' });
        }
        
        if (row) {
            req.isAdmin = true;
            req.adminId = row.id;
            next();
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
};

// Admin routes
apiRouter.post('/admin/login', authenticateAdmin, (req, res) => {
    res.json({ success: true, message: 'Login successful' });
});

apiRouter.get('/admin/products', async (req, res) => {
    try {
        const products = await dbService.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

apiRouter.post('/admin/products', async (req, res) => {
    try {
        const { name, description, price, image, category, stock } = req.body;
        
        const stmt = db.prepare(`
            INSERT INTO products (name, description, price, image, category, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run([name, description, price, image, category, stock]);
        const product = await dbService.getProductById(result.lastID);
        
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

apiRouter.put('/admin/products/:id', async (req, res) => {
    try {
        const { name, description, price, image, category, stock } = req.body;
        const productId = req.params.id;
        
        const stmt = db.prepare(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        const result = stmt.run([name, description, price, image, category, stock, productId]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = await dbService.getProductById(productId);
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

apiRouter.delete('/admin/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        const result = stmt.run([productId]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Middleware to check if admin is logged in (for settings endpoints)
const checkAdminSession = (req, res, next) => {
    // For now, we'll allow access to settings endpoints if the request comes from admin pages
    // In a production environment, you'd want to implement proper session management
    next();
};

// Admin credentials API endpoints
apiRouter.get('/admin/credentials', checkAdminSession, async (req, res) => {
    try {
        db.get('SELECT username FROM admin_credentials LIMIT 1', (err, row) => {
            if (err) {
                console.error('Error fetching admin credentials:', err);
                return res.status(500).json({ error: 'Failed to fetch credentials' });
            }
            
            if (row) {
                res.json({ username: row.username });
            } else {
                res.status(404).json({ error: 'Admin credentials not found' });
            }
        });
    } catch (error) {
        console.error('Error fetching admin credentials:', error);
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
});

apiRouter.post('/admin/update-username', checkAdminSession, async (req, res) => {
    try {
        const { newUsername } = req.body;
        
        if (!newUsername || newUsername.trim().length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
            return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
        }
        
        const stmt = db.prepare('UPDATE admin_credentials SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1');
        const result = stmt.run([newUsername.trim()]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Admin credentials not found' });
        }
        
        res.json({ success: true, message: 'Username updated successfully' });
    } catch (error) {
        console.error('Error updating username:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Username already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update username' });
        }
    }
});

apiRouter.post('/admin/update-password', checkAdminSession, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }
        
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
            return res.status(400).json({ error: 'New password must contain at least one letter and one number' });
        }
        
        // Hash the current password to verify
        const crypto = require('crypto');
        const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
        
        // First verify the current password
        db.get('SELECT id FROM admin_credentials WHERE password = ?', [hashedCurrentPassword], (err, row) => {
            if (err) {
                console.error('Error verifying current password:', err);
                return res.status(500).json({ error: 'Failed to verify current password' });
            }
            
            if (!row) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            
            // Hash the new password
            const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
            
            // Update the password
            const stmt = db.prepare('UPDATE admin_credentials SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
            const result = stmt.run([hashedNewPassword, row.id]);
            
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Admin credentials not found' });
            }
            
            res.json({ success: true, message: 'Password updated successfully' });
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// Generate a simple session ID for demo purposes
const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9);
};

// Get or create session ID
app.use((req, res, next) => {
    let sessionId = req.cookies.sessionId;
    
    if (!sessionId) {
        sessionId = generateSessionId();
        res.cookie('sessionId', sessionId, { 
            httpOnly: false, // Changed to false so JavaScript can access it
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax'
        });
        console.log('Created new session ID:', sessionId);
    } else {
        console.log('Using existing session ID:', sessionId);
    }
    
    // Ensure sessionId is always defined
    req.sessionId = sessionId;
    next();
});

// Products API
apiRouter.get('/products', async (req, res) => {
    try {
        const products = await dbService.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

apiRouter.get('/products/:id', async (req, res) => {
    try {
        const product = await dbService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Cart API
apiRouter.get('/cart', async (req, res) => {
    try {
        console.log('Fetching cart for session:', req.sessionId);
        const cart = await dbService.getOrCreateCart(req.sessionId);
        const items = await dbService.getCartItems(cart.id);
        res.json({ cart, items });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

apiRouter.post('/cart/items', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        console.log('Adding to cart - Session:', req.sessionId, 'Product:', productId, 'Quantity:', quantity);
        const cart = await dbService.getOrCreateCart(req.sessionId);
        const item = await dbService.addToCart(cart.id, productId, quantity);
        
        // Get updated cart items
        const items = await dbService.getCartItems(cart.id);
        res.json({ success: true, item, items });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

apiRouter.put('/cart/items/:productId', async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await dbService.getOrCreateCart(req.sessionId);
        const success = await dbService.updateCartItem(cart.id, req.params.productId, quantity);
        
        if (!success) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        
        const items = await dbService.getCartItems(cart.id);
        res.json({ success: true, items });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Failed to update cart item' });
    }
});

apiRouter.delete('/cart/items/:productId', async (req, res) => {
    try {
        const cart = await dbService.getOrCreateCart(req.sessionId);
        const success = await dbService.removeFromCart(cart.id, req.params.productId);
        
        if (!success) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        
        const items = await dbService.getCartItems(cart.id);
        res.json({ success: true, items });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

// Serve the main HTML file for all other routes (but not API routes)
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    const filePath = path.join(__dirname, 'public', req.path === '/' ? 'index.html' : req.path);
    
    // Check if the file exists
    if (fs.existsSync(filePath) && !filePath.endsWith('/')) {
        res.sendFile(filePath);
    } else if (fs.existsSync(filePath + '.html')) {
        res.sendFile(filePath + '.html');
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        res.sendFile(path.join(filePath, 'index.html'));
    } else {
        // If file doesn't exist, send the main index.html for client-side routing
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: 'Something went wrong on the server'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});
