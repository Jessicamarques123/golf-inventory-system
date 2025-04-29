const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const addButton = document.getElementById('add-product');
const productList = document.getElementById('product-list');
const feedbackMessage = document.getElementById('feedback-message');  // Novo elemento para feedback

// Function to fetch products from backend
function fetchProducts() {
  fetch('http://localhost:3000/products')  // ✅ URL corrigida
    .then(response => response.json())
    .then(products => {
      productList.innerHTML = '';  // Limpa a lista antes de adicionar novos produtos
      products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.id = `product-${product.id}`;
        productDiv.innerHTML = `
          Name: ${product.name} | Price: €${product.price} | Stock: ${product.quantity}
          <button onclick="deleteProduct(${product.id})">Delete</button>
        `;
        productList.appendChild(productDiv);
      });
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      showFeedback('Error fetching products. Please try again.', 'error');
    });
}

// Function to add a new product
function addProduct() {
  const name = nameInput.value;
  const category = categoryInput.value;
  const price = parseFloat(priceInput.value);
  const stock = parseInt(stockInput.value);

  // Validar se os campos estão preenchidos
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

  // Enviar o novo produto para o backend
  fetch('http://localhost:3000/products', {  // ✅ URL corrigida
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newProduct)
  })
    .then(response => response.json())
    .then(() => {
      fetchProducts();  // Atualiza a lista de produtos
      showFeedback('Product added successfully!', 'success');
      clearFields();  // Limpa os campos após adicionar
    })
    .catch(error => {
      console.error('Error adding product:', error);
      showFeedback('Error adding product. Please try again.', 'error');
    });
}

// Function to delete a product (frontend only)
function deleteProduct(productId) {
  fetch(`http://localhost:3000/products/${productId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.ok) {
        fetchProducts(); // Atualiza a lista após a exclusão
      } else {
        alert('Failed to delete product.');
      }
    })
    .catch(error => console.error('Error deleting product:', error));
}

// Função para limpar os campos de entrada
function clearFields() {
  nameInput.value = '';
  categoryInput.value = '';
  priceInput.value = '';
  stockInput.value = '';
}

// Função para exibir mensagens de feedback (sucesso/erro)
function showFeedback(message, type) {
  feedbackMessage.textContent = message;
  feedbackMessage.style.color = type === 'success' ? 'green' : 'red';
  setTimeout(() => {
    feedbackMessage.textContent = '';  // Limpa a mensagem após 3 segundos
  }, 3000);
}

// Carregar produtos quando a página carregar
window.onload = fetchProducts;

// Evento de clique no botão "Adicionar"
addButton.addEventListener('click', addProduct);
