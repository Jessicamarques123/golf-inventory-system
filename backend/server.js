const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = './inventory.json';

// Lê e parseia o arquivo JSON
function readInventory() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading inventory.json:', err.message);
    return [];
  }
}

// Salva o inventário no arquivo
function saveInventory(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error save inventory.json:', err.message);
  }
}

// GET - Lista todos os produtos
app.get('/products', (req, res) => {
  const products = readInventory();
  res.json(products);
});

// POST - Adiciona novo produto
app.post('/products', (req, res) => {
  const products = readInventory();
  const newProduct = req.body;
  newProduct.id = Date.now(); // Gera ID único baseado em timestamp
  products.push(newProduct);
  saveInventory(products);
  res.status(201).json(newProduct);
});

// DELETE - Remove produto por ID
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  const products = readInventory();
  const updatedProducts = products.filter(p => parseInt(p.id) !== id);
  saveInventory(updatedProducts);
  res.status(204).send();
});

//  PUT - Atualiza produto por ID
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  const updatedData = req.body;
  console.log(` PUT /products/${id} - Received data:`, updatedData);

  let products = readInventory();
  const index = products.findIndex(p => parseInt(p.id) === id);

  if (index === -1) {
    console.warn(` Product ID ${id} not found`);
    return res.status(404).json({ error: 'Product not found' });
  }

  products[index] = { ...products[index], ...updatedData, id };
  saveInventory(products);
  console.log(`Product ID ${id} updated successfully`);
  res.json(products[index]);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
