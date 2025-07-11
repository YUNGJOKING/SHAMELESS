// MAIN SCRIPT: Render products + Flash sale timer + Dark/Light mode toggle

const productsContainer = document.getElementById('products-container');

function renderProducts() {
  productsContainer.innerHTML = '';

  products.forEach(product => {
    let priceHTML = `<span class="product-price">$${product.price.toFixed(2)}</span>`;
    if (product.dealOfTheDay) {
      const discountedPrice = product.price * (1 - product.dealDiscount);
      priceHTML = `
        <span class="original-price">$${product.price.toFixed(2)}</span>
        <span class="product-price">$${discountedPrice.toFixed(2)}</span>
        <span class="deal-badge">Deal of the Day</span>
      `;
    }

    const productHTML = document.createElement('div');
    productHTML.className = 'product-card';
    productHTML.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <div class="product-content">
        <div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
        </div>
        <div>
          ${priceHTML}
          <button class="add-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(productHTML);
  });
}

// Flash Sale Countdown Timer
function startFlashSaleTimer() {
  const countdown = document.getElementById('countdown-timer');
  const dealEnd = new Date();
  dealEnd.setHours(23, 59, 59, 999);

  function updateTimer() {
    const diff = dealEnd - new Date();
    if (diff <= 0) {
      countdown.textContent = '00:00:00';
      clearInterval(timerId);
      document.getElementById('flash-sale-banner').style.display = 'none';
      return;
    }
    const hrs = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
    const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    countdown.textContent = `${hrs}:${mins}:${secs}`;
  }

  updateTimer();
  const timerId = setInterval(updateTimer, 1000);
}

// Dark/Light mode toggle
const modeToggleBtn = document.getElementById('mode-toggle');
modeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  if(document.body.classList.contains('light-mode')){
    localStorage.setItem('shamelessTheme', 'light');
  } else {
    localStorage.setItem('shamelessTheme', 'dark');
  }
});

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('shamelessTheme');
  if(savedTheme === 'light'){
    document.body.classList.add('light-mode');
  }
  renderProducts();
  startFlashSaleTimer();
});
