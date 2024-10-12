let subtotal = 0;
let currentInput = "0.00";
let cartItems = [];
let allProducts = []; // Declare this globally to be accessed in functions

function pressKey(num) {
  if (num === '.' && currentInput.includes('.')) return;
  if (currentInput === "0.00" || currentInput === "0") {
    currentInput = num.toString();
  } else {
    currentInput += num.toString();
  }
  updateDisplay();
}

function updateDisplay() {
  document.getElementById('display').innerText = `$${subtotal.toFixed(2)}`;
}

function clearDisplay() {
  currentInput = "0.00";
  updateDisplay();
}

document.getElementById('product-input').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    let input = this.value.trim();
    if (input) {
      // Normalize the input to lower case for comparison
      let normalizedInput = input.toLowerCase();
      let existingProduct = allProducts.find(product => product.name.toLowerCase() === normalizedInput);
      
      if (existingProduct) {
        addProductToCart(existingProduct.name, existingProduct.price, 1);
      } else {
        alert("Product not available in the list. Please use the lookup.");
      }
      this.value = ''; // Clear the input field
    }
  }
});

function addProductToCart(name, price, quantity) {
  let productList = document.getElementById('product-list');
  let existingProduct = cartItems.find(item => item.name.toLowerCase() === name.toLowerCase()); // Check for existing product ignoring case
  
  if (existingProduct) {
    existingProduct.quantity += quantity;
    existingProduct.totalPrice = existingProduct.price * existingProduct.quantity;

    let productItem = Array.from(productList.children).find(el => el.querySelector('.product-item-name').innerText.toLowerCase() === name.toLowerCase());
    productItem.querySelector('.product-item-quantity').innerText = `x${existingProduct.quantity}`;
    productItem.querySelector('.product-item-price').innerText = `$${existingProduct.totalPrice.toFixed(2)}`;
  } else {
    let product = document.createElement('div');
    product.className = "product-item";
    product.dataset.index = cartItems.length;
    let totalPrice = price * quantity;

    // Capitalize the first letter of the product name for display
    let displayName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    product.innerHTML = `
      <div class="product-item-details">
        <span class="product-item-name">${displayName}</span>
        <span class="product-item-quantity">x${quantity}</span>
        <span class="product-item-price">$${totalPrice.toFixed(2)}</span>
      </div>`;

    product.addEventListener('click', selectProduct);
    productList.appendChild(product);

    cartItems.push({ name, price, quantity, totalPrice });
  }

  updateSubtotal();
  updateDisplay();
  saveCartToLocalStorage();
}

function selectProduct(event) {
  let productItems = document.querySelectorAll('.product-item');
  productItems.forEach(item => item.classList.remove('selected'));
  
  let selectedItem = event.currentTarget;
  selectedItem.classList.add('selected');
}

function removeSelectedProduct() {
  let selectedProduct = document.querySelector('.product-item.selected');
  if (selectedProduct) {
    let index = parseInt(selectedProduct.dataset.index);
    cartItems.splice(index, 1);
    selectedProduct.remove();
    updateProductIndices();
    updateSubtotal();
    updateDisplay();
  } else {
    alert("Please select a product to remove.");
  }
}

function updateProductIndices() {
  let productItems = document.querySelectorAll('.product-item');
  productItems.forEach((item, index) => {
    item.dataset.index = index;
  });
}

function updateSubtotal() {
  subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  document.getElementById('display').innerText = `$${subtotal.toFixed(2)}`;
}

function processTransaction() {
  if (subtotal > 0 && cartItems.length > 0) { // Ensure there are items in the cart
    showPaymentModal();
  } else {
    alert("No items in the cart to process.");
  }
}

function processPayment() {
  let amountPaid = parseFloat(document.getElementById('paymentInput').value);
  if (amountPaid >= subtotal) {
    let change = amountPaid - subtotal;
    alert(`Payment of $${amountPaid.toFixed(2)} received. Change: $${change.toFixed(2)}`);
    document.getElementById('display').innerText = `Change: $${change.toFixed(2)}`;
    resetCart(); // Clear the cart after showing the change
    closePaymentModal();
  } else {
    alert("Insufficient payment amount.");
  }
}

function showPaymentModal() {
  document.getElementById('modalTotal').innerText = subtotal.toFixed(2);
  document.getElementById('paymentModal').style.display = 'block';

  let suggestionButtons = document.getElementById('suggestionButtons');
  suggestionButtons.innerHTML = '';

  let suggestions = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  let closestSuggestions = suggestions
    .filter(amount => amount > subtotal)
    .slice(0, 4);

  if (closestSuggestions.length < 4) {
    let highestSuggestion = Math.max(...suggestions);
    while (closestSuggestions.length < 4) {
      highestSuggestion *= 2;
      closestSuggestions.push(highestSuggestion);
    }
  }

  suggestions = [...new Set(closestSuggestions)].sort((a, b) => a - b);
  suggestions.forEach(amount => {
    let button = document.createElement('button');
    button.innerText = `$${amount.toFixed(2)}`;
    button.onclick = function() {
      document.getElementById('paymentInput').value = amount.toFixed(2);
    };
    suggestionButtons.appendChild(button);
  });
}

function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
}

function processPayment() {
  let amountPaid = parseFloat(document.getElementById('paymentInput').value);
  if (amountPaid >= subtotal) {
    let change = amountPaid - subtotal;
    alert(`Payment of $${amountPaid.toFixed(2)} received. Change: $${change.toFixed(2)}`);
    document.getElementById('display').innerText = `Change: $${change.toFixed(2)}`;
    resetCart(); // Clear the cart after showing the change
    closePaymentModal();
  } else {
    alert("Insufficient payment amount.");
  }
}


function resetCart() {
  document.getElementById('product-list').innerHTML = '';
  subtotal = 0;
  cartItems = [];
  updateSubtotal();
  clearDisplay();
}

function printReceipt(amountPaid, change) {
  let receiptContent = "===== RECEIPT =====\n\n";
  cartItems.forEach(item => {
    receiptContent += `${item.name} x${item.quantity}: $${item.totalPrice.toFixed(2)}\n`;
  });
  receiptContent += `\nSubtotal: $${subtotal.toFixed(2)}`;
  receiptContent += `\nAmount Paid: $${amountPaid.toFixed(2)}`;
  receiptContent += `\nChange: $${change.toFixed(2)}`;
  receiptContent += "\n\nThank you for your purchase!";

  let receiptWindow = window.open('', '_blank');
  receiptWindow.document.write('<pre>' + receiptContent + '</pre>');
  receiptWindow.document.close();
  receiptWindow.print();
}

function overridePrice() {
  let selectedProduct = document.querySelector('.product-item.selected');
  if (selectedProduct) {
    let index = parseInt(selectedProduct.dataset.index);
    let product = cartItems[index];
    let newPrice = prompt(`Enter new price for ${product.name}:`);
    if (newPrice !== null && !isNaN(newPrice)) {
      newPrice = parseFloat(newPrice);
      product.price = newPrice;
      product.totalPrice = newPrice * product.quantity;
      updateSubtotal();
      updateDisplay();
      
      selectedProduct.querySelector('.product-item-price').innerText = `$${product.totalPrice.toFixed(2)}`;
    }
  } else {
    alert("Please select a product to override price.");
  }
}

function openCashDrawer() {
  alert("Cash Drawer opened.");
}

function reprint() {
  if (cartItems.length > 0) {
    printReceipt(subtotal, 0);
  } else {
    alert("No recent transaction to reprint.");
  }
}

function applyDiscount() {
  let discountPercent = prompt("Enter discount percentage:");
  if (discountPercent !== null && !isNaN(discountPercent)) {
    discountPercent = parseFloat(discountPercent);
    cartItems.forEach(item => {
      item.totalPrice *= (1 - discountPercent / 100);
    });
    updateSubtotal();
    updateDisplay();
    alert(`Discount of ${discountPercent}% applied.`);
    
    let productList = document.getElementById('product-list');
    Array.from(productList.children).forEach((productItem, index) => {
      productItem.querySelector('.product-item-price').innerText = `$${cartItems[index].totalPrice.toFixed(2)}`;
    });
  }
}

function addNewItem() {
  let itemName = prompt("Enter item name:");
  let itemPrice = prompt("Enter item price:");
  if (itemName && itemPrice && !isNaN(itemPrice)) {
    addProductToCart(itemName, parseFloat(itemPrice), 1);
  } else {
    alert("Invalid item details.");
  }
}

function changeQuantity() {
  let selectedProduct = document.querySelector('.product-item.selected');
  if (selectedProduct) {
    let index = parseInt(selectedProduct.dataset.index);
    let product = cartItems[index];
    showQuantityModal(product);
  } else {
  
  }
}

function showQuantityModal(product) {
  let modal = document.getElementById('quantityModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quantityModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Change Quantity</h2>
        <p>Product: <span id="modalProductName"></span></p>
        <input type="number" id="newQuantity" min="1" value="1">
        <button onclick="updateProductQuantity()">Update</button>
        <button onclick="closeQuantityModal()">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('newQuantity').value = product.quantity;
  modal.style.display = 'block';
}

function closeQuantityModal() {
  document.getElementById('quantityModal').style.display = 'none';
}

function updateProductQuantity() {
  let newQuantity = parseInt(document.getElementById('newQuantity').value);
  if (!isNaN(newQuantity) && newQuantity > 0) {
    let selectedProduct = document.querySelector('.product-item.selected');
    if (selectedProduct) {
      let index = parseInt(selectedProduct.dataset.index);
      let product = cartItems[index];
      product.quantity = newQuantity;
      product.totalPrice = product.price * newQuantity;
      updateSubtotal();
      updateDisplay();
      
      selectedProduct.querySelector('.product-item-quantity').innerText = `x${newQuantity}`;
      selectedProduct.querySelector('.product-item-price').innerText = `$${product.totalPrice.toFixed(2)}`;
      
      closeQuantityModal();
    } else {
      alert("No product selected to update quantity.");
    }
  } else {
    alert("Please enter a valid quantity.");
  }
}

function showProductLookup() {
  document.getElementById('lookupModal').style.display = 'block';
  populateProductTable(allProducts);
}

function closeProductLookup() {
  document.getElementById('lookupModal').style.display = 'none';
}

function populateProductTable(products) {
  let tableBody = document.querySelector('#productTable tbody');
  tableBody.innerHTML = '';
  products.forEach(product => {
    let row = tableBody.insertRow();
    let nameCell = row.insertCell(0);
    let priceCell = row.insertCell(1);
    nameCell.textContent = product.name;
    priceCell.textContent = `$${product.price.toFixed(2)}`;
    row.addEventListener('click', () => {
      addProductToCart(product.name, product.price, 1);
      closeProductLookup();
    });
  });
}

function filterProducts() {
  let searchTerm = document.getElementById('productSearch').value.toLowerCase();
  let filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm)
  );
  populateProductTable(filteredProducts);
}

function initPOS() {
  updateDisplay();
  allProducts = [
    { name: "Apple", price: 0.50 },
    { name: "Banana", price: 0.75 },
    { name: "Orange", price: 0.60 },
    { name: "Milk", price: 2.50 },
    { name: "Bread", price: 1.50 },
  ];

  document.getElementById('lookup-product').addEventListener('click', showProductLookup);
  document.getElementById('product-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      let input = this.value.trim();
      if (input) {
        if (/^\d+$/.test(input)) {
          addProductToCart(`Product (${input})`, 9.99, 1);
        } else {
          addProductToCart(input, 9.99, 1);
        }
        this.value = '';
      }
    }
  });

  document.getElementById('productSearch').addEventListener('input', filterProducts);
  
  // Add event listener for the pay button
  document.querySelector('.pay-button').addEventListener('click', showPaymentModal);
  
  // Add event listener for the close button in the lookup modal
  document.querySelector('#lookupModal .close').addEventListener('click', closeProductLookup);
  
  // Add event listener for the Qty button
  document.querySelector('button[onclick="changeQuantity()"]').addEventListener('click', changeQuantity);
}

document.addEventListener('DOMContentLoaded', initPOS);


