const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const addButton = document.getElementById('add-product');
const productList = document.getElementById('product-list');
const feedbackMessage = document.getElementById('feedback-message');

// Função para buscar os produtos do backend
function fetchProducts() {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(products => {
      productList.innerHTML = ''; // Limpa a lista

      products.forEach(product => {
        const row = document.createElement('tr');
        row.id = `product-${product.id}`;

        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.category || '-'}</td>
          <td>€${product.price.toFixed(2)}</td>
          <td>${product.quantity}</td>
          <td>
            <button onclick="deleteProduct(${product.id})" class="btn-delete btn-sm">Delete</button>
            <button onclick="editProduct(${product.id})" class="btn-edit btn-sm">Edit</button>
          </td>
        `;

        productList.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      showFeedback('Error fetching products. Please try again.', 'error');
    });
}

// Função para adicionar novo produto
function addProduct() {
  const name = nameInput.value;
  const category = categoryInput.value;
  const price = parseFloat(priceInput.value);
  const stock = parseInt(stockInput.value);

  if (!name || !category || isNaN(price) || isNaN(stock)) {
    showFeedback('Please fill all the fields!', 'error');
    return;
  }

  const newProduct = {
    name: name,
    category: category,
    price: price,
    quantity: stock
  };

  fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newProduct)
  })
    .then(response => response.json())
    .then(() => {
      fetchProducts();
      showFeedback('Product added successfully!', 'success');
      clearFields();
    })
    .catch(error => {
      console.error('Error adding product:', error);
      showFeedback('Error adding product. Please try again.', 'error');
    });
}

// Função para deletar produto
function deleteProduct(productId) {
  fetch(`http://localhost:3000/products/${productId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product.');
      }
    })
    .catch(error => console.error('Error deleting product:', error));
}

// (Opcional) Função para edição futura
function editProduct(productId) {
  alert(`Edit feature coming soon for product ID: ${productId}`);
}

// Limpa os campos do formulário
function clearFields() {
  nameInput.value = '';
  categoryInput.value = '';
  priceInput.value = '';
  stockInput.value = '';
}

// Mostra feedback na tela
function showFeedback(message, type) {
  feedbackMessage.textContent = message;
  feedbackMessage.style.color = type === 'success' ? 'green' : 'red';
  setTimeout(() => {
    feedbackMessage.textContent = '';
  }, 3000);
}

// Inicialização
window.onload = fetchProducts;
addButton.addEventListener('click', addProduct);
