// script.js - Main JavaScript for the website

// Global variables
let cartSidebar = null;
let cartIcon = null;

function initializeCart() {
    console.log('Initializing cart...');
    
    // Get cart elements
    cartIcon = document.querySelector('.cart-icon');
    cartSidebar = document.querySelector('.cart-sidebar');
    const closeCart = document.querySelector('.close-cart');
    
    console.log('Cart elements:', { cartIcon, cartSidebar, closeCart });
    
    // Only initialize if elements exist and not already initialized
    if (cartIcon && cartSidebar && !cartIcon.hasAttribute('data-initialized')) {
        cartIcon.setAttribute('data-initialized', 'true');
        
        // Toggle cart sidebar when clicking cart icon
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Cart icon clicked');
            
            // Close mobile navigation if open
            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            const nav = document.querySelector('nav');
            if (mobileMenuToggle && nav && nav.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            cartSidebar.classList.toggle('show');
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.classList.toggle('active');
            
            // Prevent body scroll when cart is open on mobile
            if (cartSidebar.classList.contains('show')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            
            updateCartDisplay();
        });
        
        // Add swipe to close functionality for mobile cart
        let startX = 0;
        let startY = 0;
        
        cartSidebar.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        cartSidebar.addEventListener('touchmove', function(e) {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // If horizontal swipe is greater than vertical and significant
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                // Swipe left to close cart
                if (diffX > 0) {
                    cartSidebar.classList.remove('show');
                    const overlay = document.querySelector('.overlay');
                    if (overlay) overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
        
        cartSidebar.addEventListener('touchend', function() {
            startX = 0;
            startY = 0;
        });
    }
    
    // Close cart when clicking close button
    if (closeCart && !closeCart.hasAttribute('data-initialized')) {
        closeCart.setAttribute('data-initialized', 'true');
        closeCart.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Close cart clicked');
            cartSidebar.classList.remove('show');
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInsideCart = cartSidebar && cartSidebar.contains(e.target);
        const isClickOnCartIcon = cartIcon && (e.target === cartIcon || cartIcon.contains(e.target));
        
        if (cartSidebar && cartSidebar.classList.contains('show') && !isClickInsideCart && !isClickOnCartIcon) {
            console.log('Clicked outside cart, closing...');
            cartSidebar.classList.remove('show');
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Initialize cart display
    updateCartCount();
    
    // If we're on the cart page, initialize it
    if (document.querySelector('.cart-page')) {
        updateCartDisplay();
    }
    
    // Add checkout button event listener
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn && !checkoutBtn.hasAttribute('data-initialized')) {
        checkoutBtn.setAttribute('data-initialized', 'true');
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Checkout button clicked');
            
            // Get cart from localStorage
            let cart = [];
            try {
                cart = JSON.parse(localStorage.getItem('cart') || '[]');
            } catch (error) {
                console.error('Error loading cart:', error);
                cart = [];
            }
            
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // Redirect to checkout page
            window.location.href = 'checkout.html';
        });
    }
}

// Mobile Navigation
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

// Call initializeCart and mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    initializeMobileNavigation();
});

// Function to update the cart display in the sidebar
async function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    
    console.log('Updating cart display. Container:', cartItemsContainer);
    
    if (!cartItemsContainer) {
        console.error('Cart items container not found!');
        return;
    }
    
    // Add click event delegation for cart controls
    cartItemsContainer.addEventListener('click', function(e) {
        // Handle plus button click
        if (e.target.closest('.cart-qty-plus')) {
            const btn = e.target.closest('.cart-qty-plus');
            const input = btn.parentElement.querySelector('.cart-qty-input');
            const productId = btn.getAttribute('data-id');
            const newQuantity = Math.min(99, (parseInt(input.value) || 1) + 1);
            input.value = newQuantity;
            updateCartItemQuantity(productId, newQuantity);
        }
        // Handle minus button click
        else if (e.target.closest('.cart-qty-minus')) {
            const btn = e.target.closest('.cart-qty-minus');
            const input = btn.parentElement.querySelector('.cart-qty-input');
            const productId = btn.getAttribute('data-id');
            const currentQuantity = parseInt(input.value) || 1;
            const newQuantity = Math.max(1, currentQuantity - 1);
            if (newQuantity !== currentQuantity) {
                input.value = newQuantity;
                updateCartItemQuantity(productId, newQuantity);
            }
        }
        // Handle remove item button click
        else if (e.target.closest('.cart-remove-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.cart-remove-btn');
            const productId = btn.getAttribute('data-id');
            removeFromCart(productId);
        }
    });

    // Handle direct input changes in cart
    cartItemsContainer.addEventListener('input', function(e) {
        if (e.target.classList.contains('cart-qty-input')) {
            const value = parseInt(e.target.value);
            const productId = e.target.getAttribute('data-id');
            if (value < 1) {
                e.target.value = 1;
                updateCartItemQuantity(productId, 1);
            } else if (value > 99) {
                e.target.value = 99;
                updateCartItemQuantity(productId, 99);
            } else {
                updateCartItemQuantity(productId, value);
            }
        }
    });
    
    // Show loading state
    cartItemsContainer.innerHTML = '<div class="cart-loading"></div>';
    
    // Get cart from localStorage
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('Cart data from localStorage:', cart);
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart = [];
    }
    
    // Clear existing items after a small delay for loading effect
    setTimeout(() => {
        // If cart is empty, show empty message
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    Your cart is empty<br>
                    <small>Add some items to get started</small>
                </div>`;
            if (cartTotal) {
                cartTotal.innerHTML = `
                    <span>Subtotal</span>
                    <span class="amount">$0.00</span>`;
            }
            return;
        }
        
        // Add each item to the cart display
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
                        <img src="${item.image || 'https://via.placeholder.com/60'}" 
                             alt="${item.name || 'Product'}" 
                             onerror="this.src='https://via.placeholder.com/60'">
                    </div>
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name || 'Unnamed Product'}</h4>
                        <p class="cart-item-description">${item.description || 'No description available'}</p>
                        <p class="cart-item-price">$${price.toFixed(2)} each</p>
                        <div class="cart-item-controls">
                            <div class="cart-quantity-selector">
                                <button class="cart-qty-btn cart-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                                <input type="number" class="cart-qty-input" data-id="${item.id}" value="${quantity}" min="1" max="99">
                                <button class="cart-qty-btn cart-qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                            </div>
                            <button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove item" title="Remove item">×</button>
                        </div>
                        <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
                    </div>
                </div>`;
        });
        
        cartItemsContainer.innerHTML = itemsHTML;
        
        // Update total
        if (cartTotal) {
            cartTotal.innerHTML = `
                <span>Subtotal</span>
                <span class="amount">$${total.toFixed(2)}</span>`;
        }
        
        // Add event listeners
        setupCartEventListeners();
    }, 300); // Small delay for loading effect
}

// Function to update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
    if (!productId || newQuantity < 1) return;
    
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
    }
}

// Function to remove an item from the cart
function removeFromCart(productId) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Add animation class before removing
        const itemElement = document.querySelector(`.cart-item[data-id="${productId}"]`);
        if (itemElement) {
            itemElement.classList.add('removing');
            
            // Wait for animation to complete before removing
            setTimeout(() => {
                updateCartDisplay();
                updateCartCount();
                
                // Show removed notification
                showNotification('Item removed from cart');
            }, 200);
        } else {
            // If element not found, just update the cart
            updateCartDisplay();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
    }
}

// Function to update the cart count in the header
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        // Update all cart count elements on the page
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Function to show notification
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

// Make the updateCartCount function available globally
window.updateCartCount = updateCartCount;
