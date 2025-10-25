const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'data', 'webshop.db');
        this.db = new sqlite3.Database(this.dbPath);
    }

    // Product methods
    async getProducts() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM products', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getProductById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async createProduct(product) {
        const { name, description, price, image, category, stock } = product;
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
                [name, description, price, image, category, stock],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    async updateProduct(id, updates) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);

        return new Promise((resolve, reject) => {
            this.db.run(query, values, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    async deleteProduct(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // Cart methods
    async getOrCreateCart(sessionId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM cart WHERE session_id = ?', [sessionId], (err, row) => {
                if (err) {
                    return reject(err);
                }
                
                if (row) {
                    resolve(row);
                } else {
                    this.db.run(
                        'INSERT INTO cart (session_id) VALUES (?)',
                        [sessionId],
                        function(err) {
                            if (err) return reject(err);
                            resolve({ id: this.lastID, session_id: sessionId });
                        }
                    );
                }
            });
        });
    }

    async getCartItems(cartId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT ci.*, p.name, p.image, p.price as product_price 
                 FROM cart_items ci 
                 JOIN products p ON ci.product_id = p.id 
                 WHERE ci.cart_id = ?`,
                [cartId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    async addToCart(cartId, productId, quantity = 1) {
        const product = await this.getProductById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        return new Promise((resolve, reject) => {
            // Check if item already in cart
            this.db.get(
                'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cartId, productId],
                (err, existingItem) => {
                    if (err) return reject(err);

                    if (existingItem) {
                        // Update quantity if item exists
                        const newQuantity = existingItem.quantity + quantity;
                        this.db.run(
                            'UPDATE cart_items SET quantity = ? WHERE id = ?',
                            [newQuantity, existingItem.id],
                            function(err) {
                                if (err) return reject(err);
                                resolve({ ...existingItem, quantity: newQuantity });
                            }
                        );
                    } else {
                        // Add new item to cart
                        this.db.run(
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
    }

    async updateCartItem(cartId, productId, quantity) {
        if (quantity <= 0) {
            return this.removeFromCart(cartId, productId);
        }

        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
                [quantity, cartId, productId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    async removeFromCart(cartId, productId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cartId, productId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    async clearCart(cartId) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }
}

// Create a singleton instance
const dbService = new DatabaseService();
module.exports = dbService;
