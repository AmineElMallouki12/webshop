# WebShop with SQLite Database

This is a simple webshop application that uses SQLite as its database backend.

## Setup Instructions

1. **Install Node.js**
   - Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Initialize the Database**
   ```bash
   npm run init-db
   ```
   This will create a `data` directory with an SQLite database file.

4. **Start the Server**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`.

5. **Development**
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Database Schema

The database consists of the following tables:

### Products
- `id` - Auto-incrementing primary key
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `image` - URL to product image
- `category` - Product category
- `stock` - Available stock quantity
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

### Cart
- `id` - Auto-incrementing primary key
- `session_id` - Unique session identifier
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

### Cart Items
- `id` - Auto-incrementing primary key
- `cart_id` - Reference to cart
- `product_id` - Reference to product
- `quantity` - Quantity of the product in cart
- `price` - Price at time of adding to cart
- `created_at` - Timestamp of creation

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product

### Cart
- `GET /api/cart` - Get or create cart for the current session
- `POST /api/cart/items` - Add item to cart
  - Body: `{ "productId": 1, "quantity": 1 }`
- `PUT /api/cart/items/:productId` - Update cart item quantity
  - Body: `{ "quantity": 2 }`
- `DELETE /api/cart/items/:productId` - Remove item from cart
