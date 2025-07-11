let cart = JSON.parse(localStorage.getItem('shamelessCart')) || [];

function saveCart() {
  localStorage.setItem('shamelessCart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock === 0) {
    alert("Sorry, this product is out of stock.");
    return;
  }

  const item = cart.find(i => i.id === productId);
  if (item) {
    if (item.qty < product.stock) {
      item.qty++;
    } else {
      alert("You've reached the maximum available stock.");
      return;
    }
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
  const product = products.find(p => p.id === productId);
  const item = cart.find(i => i.id === productId);
  if (!item || !product) return;

  if (qty > product.stock) {
    alert(`Only ${product.stock} items in stock.`);
    qty = product.stock;
  }

  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }

  item.qty = qty;
  saveCart();
  renderCart();
}

function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    saveCart();
    renderCart();
  }
}

function updateCartCount() {
  const count = cart.reduce((acc, i) => acc + i.qty, 0);
  document.getElementById('cart-count').textContent = count;
}

function renderCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  const promoMessage = document.getElementById('promo-message');
  promoMessage.textContent = '';
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

  document.getElementById('cart-total').textContent = total.toFixed(2);

  // Attach event listeners for qty inputs
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const id = parseInt(e.target.dataset.id);
      let qty = parseInt(e.target.value);
      if (isNaN(qty) || qty < 1) qty = 1;
      changeQty(id, qty);
    });
  });

  // Attach event listeners for remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.dataset.id);
      removeFromCart(id);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
});
