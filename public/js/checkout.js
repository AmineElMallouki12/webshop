// checkout.js - Checkout page functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded');
    
    // Initialize cart
    initializeCart();
    
    // Initialize mobile navigation
    initializeMobileNavigation();
    
    // Load cart items and display them
    loadOrderSummary();
    
    // Handle payment method changes
    handlePaymentMethodChange();
    
    // Handle place order button
    handlePlaceOrder();
    
    // Handle back to cart button
    handleBackToCart();
});

function loadOrderSummary() {
    const orderItemsContainer = document.getElementById('orderSummaryItems');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    console.log('Loading order summary...', { orderItemsContainer, subtotalElement, shippingElement, totalElement });
    
    // Get cart from localStorage
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('Checkout cart loaded:', cart);
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p>Your cart is empty. <a href="products.html">Continue shopping</a></p>';
        return;
    }
    
    // Calculate totals
    let subtotal = 0;
    let itemsHTML = '';
    
    cart.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const itemTotal = price * quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
                </div>
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <p class="order-item-description">${item.description || 'No description'}</p>
                    <div class="order-item-meta">
                        <span class="quantity">Qty: ${quantity}</span>
                        <span class="price">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = itemsHTML;
    
    // Calculate shipping (fixed $5.99)
    const shipping = 5.99;
    const total = subtotal + shipping;
    
    // Update totals
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = `$${shipping.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

function handlePaymentMethodChange() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const bankDetailsSection = document.getElementById('bankDetailsSection');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'bankTransfer') {
                bankDetailsSection.style.display = 'block';
            } else {
                bankDetailsSection.style.display = 'none';
            }
        });
    });
}

function handlePlaceOrder() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    placeOrderBtn.addEventListener('click', function() {
        // Get selected payment method
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        
        if (!selectedPayment) {
            alert('Please select a payment method');
            return;
        }
        
        // Validate bank details if bank transfer is selected
        if (selectedPayment.value === 'bankTransfer') {
            if (!validateBankDetails()) {
                return;
            }
        }
        
        // Process order
        processOrder(selectedPayment.value);
    });
}

function validateBankDetails() {
    const bankName = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const routingNumber = document.getElementById('routingNumber').value;
    const accountHolder = document.getElementById('accountHolderName').value;
    const billingAddress = document.getElementById('billingAddress').value;
    
    if (!bankName || !accountNumber || !routingNumber || !accountHolder || !billingAddress) {
        alert('Please fill in all bank details');
        return false;
    }
    
    // Basic validation
    if (accountNumber.length < 8) {
        alert('Account number must be at least 8 digits');
        return false;
    }
    
    if (routingNumber.length !== 9) {
        alert('Routing number must be 9 digits');
        return false;
    }
    
    return true;
}

function processOrder(paymentMethod) {
    // Get cart
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (error) {
        console.error('Error loading cart:', error);
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Calculate total
    let subtotal = 0;
    cart.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        subtotal += price * quantity;
    });
    const shipping = 5.99;
    const total = subtotal + shipping;
    
    // Show processing message
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const originalText = placeOrderBtn.textContent;
    placeOrderBtn.textContent = 'Processing...';
    placeOrderBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        // Clear cart
        localStorage.removeItem('cart');
        
        // Show success message
        alert(`Order placed successfully!\n\nPayment Method: ${paymentMethod}\nTotal: $${total.toFixed(2)}\n\nThank you for your purchase!`);
        
        // Redirect to products page
        window.location.href = 'products.html';
    }, 2000);
}

// Initialize cart functionality
function initializeCart() {
    // Get cart elements
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCart = document.querySelector('.close-cart');
    
    if (cartIcon && cartSidebar) {
        // Toggle cart sidebar
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            cartSidebar.classList.toggle('show');
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.classList.toggle('active');
            updateCartDisplay();
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', function(e) {
            e.preventDefault();
            cartSidebar.classList.remove('show');
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.classList.remove('active');
        });
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInsideCart = cartSidebar && cartSidebar.contains(e.target);
        const isClickOnCartIcon = cartIcon && (e.target === cartIcon || cartIcon.contains(e.target));
        
        if (cartSidebar && cartSidebar.classList.contains('show') && !isClickInsideCart && !isClickOnCartIcon) {
            cartSidebar.classList.remove('show');
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.classList.remove('active');
        }
    });
}

function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total .amount');
    
    if (!cartItemsContainer) return;
    
    // Get cart from localStorage
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    // Display cart items
    let total = 0;
    let itemsHTML = '';
    
    cart.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const itemTotal = price * quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-description">${item.description || 'No description'}</p>
                    <div class="cart-item-meta">
                        <span class="quantity">Qty: ${quantity}</span>
                        <span class="price">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = itemsHTML;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Handle back to cart button
function handleBackToCart() {
    const backToCartBtn = document.getElementById('backToCartBtn');
    
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Back to cart clicked');
            window.location.href = 'products.html';
        });
    }
}

// Mobile Navigation (copied from script.js)
function initializeMobileNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            // Close cart if open
            const cartSidebar = document.querySelector('.cart-sidebar');
            const overlay = document.querySelector('.overlay');
            if (cartSidebar && cartSidebar.classList.contains('show')) {
                cartSidebar.classList.remove('show');
                if (overlay) overlay.classList.remove('active');
            }
            
            mobileMenuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideNav = nav.contains(e.target);
            const isClickOnToggle = mobileMenuToggle.contains(e.target);
            
            if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}
