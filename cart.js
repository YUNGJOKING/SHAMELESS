// cart.js

// Get cart from localStorage or empty array
let cart = JSON.parse(localStorage.getItem('shamelessCart')) || [];

function saveCart() {
  localStorage.setItem('shamelessCart', JSON.stringify(cart));
}

function addToCart(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty++;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  renderCart();
}

function changeQty(productId, qty) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty = qty;
    if (item.qty <= 0) removeFromCart(productId);
  }
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

// Render cart items inside #cart-items div
function renderCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  const emptyMsg = document.getElementById('empty-cart-msg');
  const cartTotalEl = document.getElementById('cart-total');

  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    emptyMsg.style.display = 'block';
    cartTotalEl.textContent = '0.00';
    document.getElementById('checkout').style.display = 'none';
    return;
  } else {
    emptyMsg.style.display = 'none';
    document.getElementById('checkout').style.display = 'block';
  }

  let total = 0;

  cart.forEach(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) return;

    const itemTotal = product.price * cartItem.qty;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="cart-img" />
      <div class="cart-details">
        <span class="cart-name">${product.name}</span>
        <span class="cart-desc">${product.description}</span>
      </div>
      <input type="number" min="1" max="99" value="${cartItem.qty}" class="qty-input" data-id="${product.id}" />
      <span class="cart-price">$${itemTotal.toFixed(2)}</span>
      <button class="remove-btn" data-id="${product.id}">X</button>
    `;
    cartItemsDiv.appendChild(div);
  });

  cartTotalEl.textContent = total.toFixed(2);

  // Event listeners for qty inputs
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const id = parseInt(e.target.dataset.id);
      let qty = parseInt(e.target.value);
      if (isNaN(qty) || qty < 1) qty = 1;
      if (qty > 99) qty = 99;
      changeQty(id, qty);
    });
  });

  // Event listeners for remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.dataset.id);
      removeFromCart(id);
    });
  });
}

// Initial render of cart on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
