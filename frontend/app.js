const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const addButton = document.getElementById('add-product');
const productList = document.getElementById('product-list');

// Function to fetch products from backend
function fetchProducts() {
  fetch('http://localhost:3000/products')  // ✅ Corrected URL
    .then(response => response.json())
    .then(products => {
      productList.innerHTML = '';
      products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.id = `product-${product.id}`;
        productDiv.innerHTML = `Name: ${product.name} | Price: €${product.price} | Stock: ${product.quantity}
          <button onclick="deleteProduct(${product.id})">Delete</button>`;
        productList.appendChild(productDiv);
      });
    })
    .catch(error => console.error('Error fetching products:', error));
}

// Function to add a new product
function addProduct() {
  const name = nameInput.value;
  const category = categoryInput.value;
  const price = parseFloat(priceInput.value);
  const stock = parseInt(stockInput.value);

  if (!name || !category || isNaN(price) || isNaN(stock)) {
    alert('Please fill all the fields!');
    return;
  }

  const newProduct = {
    name: name,
    category: category,
    price: price,
    quantity: stock
  };

  fetch('http://localhost:3000/products', {  // ✅ Corrected URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newProduct)
  })
    .then(response => response.json())
    .then(() => {
      fetchProducts();
      nameInput.value = '';
      categoryInput.value = '';
      priceInput.value = '';
      stockInput.value = '';
    })
    .catch(error => console.error('Error adding product:', error));
}

// Function to delete a product (frontend only)
function deleteProduct(productId) {
    fetch(`http://localhost:3000/products/${productId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          fetchProducts(); // Atualiza a tela
        } else {
          alert('Failed to delete product.');
        }
      })
      .catch(error => console.error('Error deleting product:', error));
  }
  

// Load products when page loads
window.onload = fetchProducts;

// Button click event
addButton.addEventListener('click', addProduct);
