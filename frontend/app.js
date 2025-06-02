const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const addButton = document.getElementById('add-product');
const updateButton = document.getElementById('update-product');
const productList = document.getElementById('product-list');
const feedbackMessage = document.getElementById('feedback-message');

// Redirect if not logged in
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}



let editProductId = null;

function fetchProducts() {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(products => {
      productList.innerHTML = '';
      products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.category || '-'}</td>
          <td>€${product.price.toFixed(2)}</td>
          <td>${product.quantity}</td>
          <td>
            <button onclick="editProduct(${product.id})" class="btn-edit">Edit</button>
            <button onclick="deleteProduct(${product.id})" class="btn-delete">Delete</button>
          </td>
        `;
        productList.appendChild(row);
      });
    })
    .catch(() => showFeedback('Error loading products.', 'error'));
}

function addProduct() {
  const product = getFormData();
  if (!product) return;

  fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
    .then(res => res.json())
    .then(() => {
      fetchProducts();
      showFeedback('Product added successfully!', 'success');
      clearForm();
    })
    .catch(() => showFeedback('Error adding product.', 'error'));
}

function updateProduct() {
  if (!editProductId) {
    showFeedback('No product selected for update.', 'error');
    return;
  }

  const product = getFormData();
  if (!product) return;

  console.log(' Updating product with ID:', editProductId);
  console.log(' Product data:', product);

  fetch(`http://localhost:3000/products/${editProductId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
    .then(async res => {
      const text = await res.text();
      if (!res.ok) {
        console.error(` Failed to update. Status ${res.status}`, text);
        showFeedback('Error updating product. Server response: ' + text, 'error');
        throw new Error(text);
      }
      console.log(' Update response:', text);
      return JSON.parse(text);
    })
    .then(() => {
      fetchProducts();
      showFeedback('Product updated successfully!', 'success');
      clearForm();
    })
    .catch(err => {
      console.error(' Update error:', err.message);
    });
}

function deleteProduct(id) {
  fetch(`http://localhost:3000/products/${id}`, {
    method: 'DELETE'
  })
    .then(() => {
      fetchProducts();
      showFeedback('Product deleted.', 'success');
    })
    .catch(() => showFeedback('Error deleting product.', 'error'));
}

function editProduct(id) {
  fetch('http://localhost:3000/products')
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id === id);
      if (!product) {
        showFeedback('Product not found for editing.', 'error');
        return;
      }

      nameInput.value = product.name;
      categoryInput.value = product.category;
      priceInput.value = product.price;
      stockInput.value = product.quantity;

      editProductId = parseInt(product.id); // garante número
      addButton.style.display = 'none';
      updateButton.style.display = 'inline-block';

      showFeedback('Editing product...', 'success');
    });
}

function getFormData() {
  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const price = parseFloat(priceInput.value);
  const stock = parseInt(stockInput.value);

  if (!name || !category || isNaN(price) || isNaN(stock)) {
    showFeedback('Please fill all fields.', 'error');
    return null;
  }

  return {
    name,
    category,
    price,
    quantity: stock
  };
}

function clearForm() {
  nameInput.value = '';
  categoryInput.value = '';
  priceInput.value = '';
  stockInput.value = '';
  editProductId = null;
  addButton.style.display = 'inline-block';
  updateButton.style.display = 'none';
}

function showFeedback(message, type) {
  feedbackMessage.textContent = message;
  feedbackMessage.style.color = type === 'success' ? 'green' : 'red';
  setTimeout(() => feedbackMessage.textContent = '', 4000);
}

addButton.addEventListener('click', addProduct);
updateButton.addEventListener('click', updateProduct);
window.onload = fetchProducts;

function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}
