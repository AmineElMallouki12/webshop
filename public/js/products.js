// products.js - Manages product data across the website

// Function to get all products from API
async function getProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// Function to render products in a container
async function renderProducts(containerSelector, limit = 0) {
    const products = await getProducts();
    console.log('Rendering products:', products);
    
    const container = document.querySelector(containerSelector);
    
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // If no products, show a message
    if (products.length === 0) {
        container.innerHTML = '<p>No products available. Please check back later.</p>';
        return;
    }

    // Limit number of products if needed (for featured products on homepage)
    const productsToShow = limit > 0 ? products.slice(0, limit) : products;

    // Generate product cards
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/200'}" alt="${product.name}">
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <div class="quantity-selector" style="display: none;">
                        <button type="button" class="qty-btn qty-minus" data-id="${product.id}" aria-label="Decrease quantity">−</button>
                        <input type="number" class="qty-input" data-id="${product.id}" value="1" min="1" max="99">
                        <button type="button" class="qty-btn qty-plus" data-id="${product.id}" aria-label="Increase quantity">+</button>
                        <button type="button" class="btn confirm-add-btn" data-id="${product.id}">
                            <span class="btn-text">Add to Cart</span>
                            <span class="btn-icon">🛒</span>
                        </button>
                    </div>
                    <div class="product-buttons">
                        <button type="button" class="btn btn-secondary details-btn" data-id="${product.id}">
                            <span class="btn-text">Details</span>
                            <span class="btn-icon">ℹ️</span>
                        </button>
                        <button type="button" class="btn add-to-cart-btn" data-id="${product.id}">
                            <span class="btn-text">Add to Cart</span>
                            <span class="btn-icon">🛒</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// Add event delegation for product interactions
document.addEventListener('click', function(e) {
    // Handle Details button - show product details modal
    const detailsBtn = e.target.closest('.details-btn');
    if (detailsBtn) {
        e.preventDefault();
        const productId = detailsBtn.getAttribute('data-id');
        showProductDetails(productId);
        return;
    }
    
    // Handle Add to Cart button - show quantity controls
    const addToCartBtn = e.target.closest('.add-to-cart-btn');
    if (addToCartBtn) {
        e.preventDefault();
        const productCard = addToCartBtn.closest('.product-card');
        const quantitySelector = productCard.querySelector('.quantity-selector');
        
        // Hide the Add to Cart button and show quantity controls
        addToCartBtn.style.display = 'none';
        quantitySelector.style.display = 'flex';
        setTimeout(() => {
            quantitySelector.style.opacity = '1';
        }, 10);
        return;
    }
    
    // Handle Confirm Add to Cart button
    const confirmAddBtn = e.target.closest('.confirm-add-btn');
    if (confirmAddBtn) {
        e.preventDefault();
        const productId = confirmAddBtn.getAttribute('data-id');
        const productCard = confirmAddBtn.closest('.product-card');
        const qtyInput = productCard.querySelector('.qty-input');
        const quantity = parseInt(qtyInput.value) || 1;
        
        console.log('Adding to cart - Product ID:', productId, 'Quantity:', quantity);
        
        if (productId) {
            // Add loading state
            const btnText = confirmAddBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            btnText.textContent = 'Adding...';
            confirmAddBtn.disabled = true;
            
            addToCart(productId, quantity).then(success => {
                if (success) {
                    // Show success animation
                    confirmAddBtn.classList.add('success');
                    btnText.textContent = 'Added!';
                    setTimeout(() => {
                        // Reset the UI
                        const addToCartButton = productCard.querySelector('.add-to-cart-btn');
                        const quantityControls = productCard.querySelector('.quantity-selector');
                        
                        // Fade out quantity controls
                        quantityControls.style.opacity = '0';
                        setTimeout(() => {
                            quantityControls.style.display = 'none';
                            addToCartButton.style.display = 'block';
                            qtyInput.value = 1; // Reset quantity
                            confirmAddBtn.classList.remove('success');
                            btnText.textContent = originalText;
                            confirmAddBtn.disabled = false;
                        }, 200);
                    }, 1500);
                } else {
                    btnText.textContent = originalText;
                    confirmAddBtn.disabled = false;
                }
            });
        }
        return;
    }
    
    // Handle quantity increase
    const plusBtn = e.target.closest('.qty-plus');
    if (plusBtn) {
        e.preventDefault();
        const productCard = plusBtn.closest('.product-card');
        const qtyInput = productCard.querySelector('.qty-input');
        let quantity = parseInt(qtyInput.value) || 1;
        if (quantity < 99) {
            qtyInput.value = quantity + 1;
            animateQuantityChange(qtyInput);
        }
        return;
    }
    
    // Handle quantity decrease
    const minusBtn = e.target.closest('.qty-minus');
    if (minusBtn) {
        e.preventDefault();
        const productCard = minusBtn.closest('.product-card');
        const qtyInput = productCard.querySelector('.qty-input');
        let quantity = parseInt(qtyInput.value) || 1;
        if (quantity > 1) {
            qtyInput.value = quantity - 1;
            animateQuantityChange(qtyInput);
        }
        return;
    }
    
    // Helper function for quantity change animation
    function animateQuantityChange(element) {
        element.classList.add('quantity-updated');
        setTimeout(() => {
            element.classList.remove('quantity-updated');
        }, 200);
    }
});

// Handle direct input changes
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('qty-input')) {
        const value = parseInt(e.target.value);
        if (value < 1) e.target.value = 1;
        if (value > 99) e.target.value = 99;
    }
});

// Function to add a product to the cart
async function addToCart(productId, quantity = 1) {
    console.log('Adding to cart, product ID:', productId, 'Quantity:', quantity);
    
    // Ensure productId is a string for consistent comparison
    productId = String(productId);
    quantity = parseInt(quantity) || 1;
    
    try {
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            // Update quantity
            existingItem.quantity += quantity;
        } else {
            // Add new item to cart
            const product = await getProductById(productId);
            if (product) {
                cart.push({
                    id: productId,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
            }
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update UI
        updateCartCount();
        
        // If cart sidebar is open, update it
        if (typeof updateCartDisplay === 'function') {
            updateCartDisplay();
        }
        
        // Show success message
        showNotification(`Product added to cart!`);
        return true;
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification(`Error: ${error.message}`);
        return false;
    }
}

async function getProductById(productId) {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const products = await response.json();
            return products.find(p => String(p.id) === String(productId));
        }
    } catch (error) {
        console.error('Error fetching product:', error);
    }
    return null;
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
        // Set count to 0 if there's an error
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = '0';
        });
    }
}

// Function to show product details modal
async function showProductDetails(productId) {
    try {
        const product = await getProductById(productId);
        if (!product) {
            showNotification('Product not found');
            return;
        }

        // Remove existing modal if it exists
        const existingModal = document.getElementById('product-details-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h2>Product Details</h2>
            <button class="modal-close" aria-label="Close modal">&times;</button>
        `;
        
        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = `
            <div class="product-details-content">
                <div class="product-details-image">
                    <img id="modal-product-image" src="" alt="">
                </div>
                <div class="product-details-info">
                    <h3 id="modal-product-name"></h3>
                    <p id="modal-product-description"></p>
                    <div class="product-details-specs">
                        <div class="spec-item">
                            <span class="spec-label">Price:</span>
                            <span id="modal-product-price" class="spec-value"></span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Stock:</span>
                            <span id="modal-product-stock" class="spec-value"></span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Category:</span>
                            <span id="modal-product-category" class="spec-value"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Create modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        modalFooter.innerHTML = `
            <button class="btn btn-secondary modal-close">Close</button>
        `;
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modalOverlay.appendChild(modalContent);
        
        // Create main modal container
        const modal = document.createElement('div');
        modal.id = 'product-details-modal';
        modal.className = 'product-details-modal';
        modal.appendChild(modalOverlay);
        
        document.body.appendChild(modal);

        // Populate modal with product data
        document.getElementById('modal-product-image').src = product.image || 'https://via.placeholder.com/300';
        document.getElementById('modal-product-name').textContent = product.name || 'Unnamed Product';
        document.getElementById('modal-product-description').textContent = product.description || 'No description available';
        document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('modal-product-stock').textContent = product.stock || 0;
        document.getElementById('modal-product-category').textContent = product.category || 'Uncategorized';

        // Show modal
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Add event listeners for modal close
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', closeProductDetailsModal);
        });

        // Close modal when clicking overlay
        const overlay = modal.querySelector('.modal-overlay');
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeProductDetailsModal();
            }
        });

    } catch (error) {
        console.error('Error showing product details:', error);
        showNotification('Error loading product details');
    }
}

// Function to close product details modal
function closeProductDetailsModal() {
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
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

// Initialize products when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Render featured products on homepage (limit to 4)
    if (document.querySelector('.featured-products .product-grid')) {
        renderProducts('.featured-products .product-grid', 4);
    }
    
    // Render all products on products page
    if (document.querySelector('.products .product-grid')) {
        renderProducts('.products .product-grid');
    }
    
    // Update cart count
    updateCartCount();
});
