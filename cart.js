// CART LOGIC
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

function renderCart() {
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

    const itemTotal = product.price * cartItem.qty;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="cart-img" />
      <div class="cart-details">
        <span class="cart-name">${product.name}</span><br/>
        <small class="cart-desc">${product.description}</small>
      </div>
      <input type="number" min="1" value="${cartItem.qty}" class="qty-input" data-id="${product.id}" />
      <span class="cart-price">$${itemTotal.toFixed(2)}</span>
      <button class="remove-btn" data-id="${product.id}">X</button>
    `;
    cartItemsDiv.appendChild(div);
  });

  document.getElementById('cart-total').textContent = total.toFixed(2);

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

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
