// Initial setup
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const cartSection = document.getElementById('cart-section');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');
const applyPromoBtn = document.getElementById('apply-promo-btn');
const promoCodeInput = document.getElementById('promo-code');
const promoMessage = document.getElementById('promo-message');
const themeToggleBtn = document.getElementById('theme-toggle');
const flashSaleTimer = document.getElementById('flash-sale-timer');

// Flash sale end time (e.g. today 23:59:59)
const flashSaleEnd = new Date();
flashSaleEnd.setHours(23, 59, 59, 999);

// Sample promo codes and their discounts
const promoCodes = {
  "SAVE10": 0.10,
  "FREESHIP": 0,
  "HALFOFF": 0.50
};

let currentDiscount = 0;

function renderProducts(productsList) {
  productsContainer.innerHTML = '';

  if (productsList.length === 0) {
    productsContainer.innerHTML = '<p style="text-align:center;">No products found.</p>';
    return;
  }

  productsList.forEach(product => {
    const priceDisplay = product.deal
      ? `<span class="original-price">$${product.price.toFixed(2)}</span><span class="product-price">$${product.dealPrice.toFixed(2)}</span> <span class="deal-badge">Deal!</span>`
      : `<span class="product-price">$${product.price.toFixed(2)}</span>`;

    const isOutOfStock = product.stock === 0;
    const addButtonText = isOutOfStock ? 'Out of Stock' : 'Add to Cart';

    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img class="product-image" src="${product.image}" alt="${product.name}" />
      <div class="product-content">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          ${priceDisplay}
          <button class="add-cart-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''} aria-label="Add ${product.name} to cart">${addButtonText}</button>
        </div>
      </div>
    `;

    productsContainer.appendChild(card);
  });

  // Add event listeners for all add to cart buttons
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.dataset.id);
      addToCart(id);
    });
  });
}

function filterAndSortProducts() {
  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchInput.value.trim().toLowerCase())
  );

  switch (sortSelect.value) {
    case 'price-asc':
      filtered.sort((a, b) => (a.deal ? a.dealPrice : a.price) - (b.deal ? b.dealPrice : b.price));
      break;
    case 'price-desc':
      filtered.sort((a, b) => (b.deal ? b.dealPrice : b.price) - (a.deal ? a.dealPrice : a.price));
      break;
  }

  renderProducts(filtered);
}

function updateFlashSaleTimer() {
  const now = new Date();
  const diff = flashSaleEnd - now;

  if (diff <= 0) {
    flashSaleTimer.textContent = '00:00:00';
    return;
  }

  const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
  const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

  flashSaleTimer.textContent = `${hours}:${minutes}:${seconds}`;
}

function toggleCartVisibility() {
  if (cartSection.style.display === 'none' || cartSection.style.display === '') {
    cartSection.style.display = 'flex';
  } else {
    cartSection.style.display = 'none';
  }
}

function applyPromoCode() {
  const code = promoCodeInput.value.trim().toUpperCase();

  if (!code) {
    promoMessage.textContent = 'Please enter a promo code.';
    currentDiscount = 0;
    renderCart();
    return;
  }

  if (promoCodes.hasOwnProperty(code)) {
    currentDiscount = promoCodes[code];
    promoMessage.textContent = `Promo code applied! You saved ${currentDiscount * 100}% off.`;
  } else {
    currentDiscount = 0;
    promoMessage.textContent = 'Invalid promo code.';
  }

  renderCartWithDiscount();
}

function renderCartWithDiscount() {
  const cartItemsDiv = document.getElementById('cart-items');
  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('cart-total').textContent = '0.00';
    return;
  }

  let total = 0;

  cart.forEach(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) return;

    const price = product.deal ? product.dealPrice : product.price;
    const itemTotal = price * cartItem.qty;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span class="cart-name">${product.name}</span>
      <input type="number" min="1" max="${product.stock}" value="${cartItem.qty}" class="qty-input" data-id="${product.id}" aria-label="Quantity of ${product.name}" />
      <span class="cart-price">$${itemTotal.toFixed(2)}</span>
      <button class="remove-btn" data-id="${product.id}" aria-label="Remove ${product.name} from cart">X</button>
    `;
    cartItemsDiv.appendChild(div);
  });

  let discountedTotal = total * (1 - currentDiscount);
  document.getElementById('cart-total').textContent = discountedTotal.toFixed(2);

  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const id = parseInt(e.target.dataset.id);
      let qty = parseInt(e.target.value);
      if (isNaN(qty) || qty < 1) qty = 1;
      changeQty(id, qty);
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.dataset.id);
      removeFromCart(id);
    });
  });
}

function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    localStorage.setItem('shamelessTheme', 'light');
  } else {
    body.classList.add('dark-theme');
    localStorage.setItem('shamelessTheme', 'dark');
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('shamelessTheme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

searchInput.addEventListener('input', filterAndSortProducts);
sortSelect.addEventListener('change', filterAndSortProducts);
cartToggleBtn.addEventListener('click', toggleCartVisibility);
clearCartBtn.addEventListener('click', clearCart);
applyPromoBtn.addEventListener('click', applyPromoCode);
themeToggleBtn.addEventListener('click', toggleTheme);

setInterval(updateFlashSaleTimer, 1000);

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  filterAndSortProducts();
  updateCartCount();
  renderCart();
  updateFlashSaleTimer();
});
