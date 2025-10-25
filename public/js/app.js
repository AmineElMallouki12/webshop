// Shopping Cart Functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.overlay');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Load cart from localStorage or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart count on page load
    updateCartCount();

    // Toggle Cart
    function toggleCart() {
        cartSidebar.classList.toggle('show');
        overlay.classList.toggle('active');
        document.body.style.overflow = cartSidebar.classList.contains('show') ? 'hidden' : '';
    }

    // Event Listeners
    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (overlay) overlay.addEventListener('click', toggleCart);

    // Add to Cart
    function addToCart(event) {
        if (!event.target.classList.contains('add-to-cart')) return;
        
        const productCard = event.target.closest('.product-card');
        const productId = productCard.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = parseFloat(productCard.querySelector('p').textContent.replace(/[^0-9.-]+/g, ''));
        const productImage = productCard.querySelector('img').src || 'https://via.placeholder.com/100';
        
        // Add animation to button
        const button = event.target;
        button.textContent = 'Added!';
        button.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.style.backgroundColor = '';
        }, 1000);

        // Check if product already in cart
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCart();
        updateCartCount();
        showNotification(`${productName} added to cart`);
        
        // If cart is closed, show a small animation on cart icon
        if (!cartSidebar.classList.contains('show')) {
            if (cartIcon) {
                cartIcon.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    cartIcon.style.transform = '';
                }, 300);
            }
        }
    }

    // Update Cart UI
    function updateCart() {
        // Update cart count
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

        // Update cart items
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        // Update total
        cartTotal.innerHTML = `Total: $${total.toFixed(2)}`;

        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', removeItem);
        });
    }

    // Handle quantity changes
    function handleQuantityChange(event) {
        const itemId = event.target.dataset.id;
        const item = cart.find(item => item.id === itemId);
        
        if (!item) return;

        if (event.target.classList.contains('plus')) {
            item.quantity += 1;
        } else if (event.target.classList.contains('minus') && item.quantity > 1) {
            item.quantity -= 1;
        }

        updateCart();
    }

    // Remove item from cart
    function removeItem(event) {
        const itemId = event.target.dataset.id;
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartCount();
        showNotification('Item removed from cart');
    }

    // Checkout
    function checkout() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Update cart count in the header
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Initialize
    function init() {
        // Add event listeners to all add to cart buttons
        document.addEventListener('click', addToCart);
        
        // Set up checkout button
        if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
        
        // Update cart UI
        updateCart();
        updateCartCount();
    }

    init();
});
