// Cart array to store items, initialized from localStorage or empty
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to localStorage
const saveCart = () => {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
};

// Add item to cart
const addToCart = (item) => {
    if (!item?.name || !item?.price) {
        console.error('Invalid item:', item);
        return;
    }
    const existingItem = cart.find(cartItem => cartItem.name === item.name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    saveCart();
    alert(`${item.name} added to cart!`);
};

// Remove item from cart
const removeFromCart = (itemName) => {
    cart = cart.filter(item => item.name !== itemName);
    saveCart();
    displayCart();
};

// Display cart items on cart page
const displayCart = () => {
    const cartTableBody = document.querySelector('#cartTableBody');
    const cartTotal = document.querySelector('#cartTotal');
    if (!cartTableBody || !cartTotal) return;

    cartTableBody.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td><button class="btn btn-danger btn-sm btn-remove" data-name="${item.name}">Remove</button></td>
        `;
        cartTableBody.appendChild(row);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
};

// Display order summary on checkout page
const displayOrderSummary = () => {
    const orderSummaryBody = document.querySelector('#orderSummaryBody');
    const orderTotal = document.querySelector('#orderTotal');
    const deliveryFee = document.querySelector('#deliveryFee');
    if (!orderSummaryBody || !orderTotal || !deliveryFee) return;

    orderSummaryBody.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name} (x${item.quantity})</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        `;
        orderSummaryBody.appendChild(row);
        subtotal += item.price * item.quantity;
    });

    const deliveryOption = document.querySelector('#deliveryOption')?.value || 'standard';
    const deliveryCosts = {
        standard: 5.00,
        express: 10.00,
        eco: 7.00
    };
    const deliveryCost = deliveryCosts[deliveryOption] || 5.00;
    deliveryFee.textContent = `$${deliveryCost.toFixed(2)}`;
    orderTotal.textContent = `$${(subtotal + deliveryCost).toFixed(2)}`;
};

// Filter and search items (for index.html)
const filterItems = () => {
    const categoryFilter = document.querySelector('#categoryFilter')?.value || 'All';
    const restaurantFilter = document.querySelector('#restaurantFilter')?.value || 'All';
    const searchQuery = document.querySelector('#searchForm input')?.value.toLowerCase() || '';
    const itemCards = document.querySelectorAll('.item-card');
    const noItemsMessage = document.querySelector('#noItemsMessage');
    let hasVisibleItems = false;

    itemCards.forEach(card => {
        const category = card.dataset.category || '';
        const restaurant = card.dataset.restaurant || '';
        const name = card.dataset.name?.toLowerCase() || '';
        const description = card.dataset.description?.toLowerCase() || '';

        const matchesCategory = categoryFilter === 'All' || category === categoryFilter;
        const matchesRestaurant = restaurantFilter === 'All' || restaurant === restaurantFilter;
        const matchesSearch = searchQuery === '' || name.includes(searchQuery) || description.includes(searchQuery);

        if (matchesCategory && matchesRestaurant && matchesSearch) {
            card.style.display = 'block';
            hasVisibleItems = true;
        } else {
            card.style.display = 'none';
        }
    });

    if (noItemsMessage) {
        noItemsMessage.style.display = hasVisibleItems ? 'none' : 'block';
    }
};

// Toggle content sections
function showContent(sectionId) {
    const sections = ['home', 'profile', 'cart'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === sectionId ? 'block' : 'none';
        }
    });
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (link.getAttribute('onclick') === `showContent('${sectionId}')`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize filters for index page
    if (window.location.pathname.includes('index.html')) {
        filterItems();

        const categoryFilter = document.querySelector('#categoryFilter');
        const restaurantFilter = document.querySelector('#restaurantFilter');
        const searchForm = document.querySelector('#searchForm');

        if (categoryFilter) categoryFilter.addEventListener('change', filterItems);
        if (restaurantFilter) restaurantFilter.addEventListener('change', filterItems);
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                filterItems();
            });
            searchForm.querySelector('input')?.addEventListener('input', filterItems);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const searchForm = document.querySelector('.navbar form');
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const searchInput = searchForm.querySelector('input[type="search"]').value.trim();
            if (searchInput) {
                window.location.href = `index.html?search=${encodeURIComponent(searchInput)}`;
            } else {
                alert('Please enter a search term.');
            }
        });
    });

    // Handle "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = {
                name: button.dataset.name,
                price: parseFloat(button.dataset.price)
            };
            addToCart(item);
        });
    });

    // Handle "View Details" buttons → now goes to product_details.html
    const viewDetailsButtons = document.querySelectorAll('.view-details');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            try {
                localStorage.setItem('selectedItem', JSON.stringify({
                    name: button.dataset.name,
                    price: parseFloat(button.dataset.price),
                    description: button.dataset.description,
                    image: button.dataset.image
                }));
                window.location.href = 'product_details.html'; // updated here
            } catch (error) {
                console.error('Error saving selected item:', error);
            }
        });
    });

    // Handle "Remove" buttons on cart page
    const cartTableBody = document.querySelector('#cartTableBody');
    if (cartTableBody) {
        cartTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                const itemName = e.target.dataset.name;
                removeFromCart(itemName);
            }
        });
    }

    // Display cart on cart page
    if (window.location.pathname.includes('delivery_request.html')) {
        displayCart();
    }

    // Handle product details page (updated to product_details.html)
    if (window.location.pathname.includes('product_details.html')) {
        try {
            const item = JSON.parse(localStorage.getItem('selectedItem'));
            if (item) {
                document.querySelector('#itemName').textContent = item.name || 'Unknown Item';
                document.querySelector('#itemPrice').textContent = `$${item.price?.toFixed(2) || '0.00'}`;
                document.querySelector('#itemDescription').textContent = item.description || 'No description available';
                document.querySelector('#itemImage').src = item.image || '';
                const addButton = document.querySelector('#addToCart');
                if (addButton) {
                    addButton.dataset.name = item.name;
                    addButton.dataset.price = item.price;
                }
            }
        } catch (error) {
            console.error('Error loading item details:', error);
        }
    }

    // Handle "Add to Cart" button on product details page
    const productAddToCartButton = document.querySelector('#addToCart');
    if (productAddToCartButton) {
        productAddToCartButton.addEventListener('click', () => {
            const nameElement = document.querySelector('#itemName');
            const priceElement = document.querySelector('#itemPrice');
            if (nameElement && priceElement) {
                const name = nameElement.textContent.trim();
                const priceText = priceElement.textContent.trim();
                const price = parseFloat(priceText.replace('$', '')); // Remove $ if present
                if (name && !isNaN(price)) {
                    addToCart({ name, price });
                } else {
                    alert('Unable to add to cart: Product details are incomplete.');
                }
            }
        });
    }

    // Handle checkout page
    if (window.location.pathname.includes('checkout.html')) {
        displayOrderSummary();

        const deliveryOption = document.querySelector('#deliveryOption');
        if (deliveryOption) {
            deliveryOption.addEventListener('change', displayOrderSummary);
        }

        const checkoutForm = document.querySelector('#checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!checkoutForm.checkValidity()) {
                    checkoutForm.classList.add('was-validated');
                    return;
                }
                alert('Order placed successfully!');
                cart = [];
                saveCart();
                window.location.href = 'index.html';
            });
        }
    }

    // Handle price sorting (for index.html)
    const sortFilter = document.querySelector('#sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            const sortValue = sortFilter.value;
            const itemCards = Array.from(document.querySelectorAll('.item-card'));
            let sortedCards = [...itemCards];

            if (sortValue !== 'all') {
                sortedCards.sort((a, b) => {
                    const priceA = parseFloat(a.querySelector('.card-text')?.textContent.replace('$', '') || 0);
                    const priceB = parseFloat(b.querySelector('.card-text')?.textContent.replace('$', '') || 0);
                    if (sortValue === 'recommended') return 0;
                    return sortValue === 'low-to-high' ? priceA - priceB : priceB - priceA;
                });
            }

            const productList = document.querySelector('#productList');
            if (productList) {
                sortedCards.forEach(card => productList.appendChild(card));
                filterItems();
            }
        });
    }
});

// Ensure profile modal opens
const profileLink = document.querySelector('a[data-bs-target="#profileModal"]');
if (profileLink) {
    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        const modalElement = document.getElementById('profileModal');
        if (modalElement) {
            try {
                // Use Bootstrap if available
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } catch (e) {
                // Fallback: manually show modal
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                modalElement.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
        }
    });
}

// Ensure close buttons work
const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modalElement = document.getElementById('profileModal');
        if (modalElement) {
            try {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            } catch (e) {
                // Fallback: manually hide modal
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                modalElement.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            }
        }
    });
});

// Set home as default
if (window.location.pathname.includes('index.html')) {
    showContent('home');
}