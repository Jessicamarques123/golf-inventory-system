const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Caminho para o arquivo JSON
const DATA_FILE = './inventory.json';

// Função para ler o JSON
function readInventory() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Função para salvar o JSON
function saveInventory(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET - Retorna todos os produtos
app.get('/products', (req, res) => {
  const products = readInventory();
  res.json(products);
});

// POST - Adiciona um novo produto
app.post('/products', (req, res) => {
  const products = readInventory();
  const newProduct = req.body;
  newProduct.id = Date.now();
  products.push(newProduct);
  saveInventory(products);
  res.status(201).json(newProduct);
});

// DELETE - Remove um produto por ID
app.delete('/products/:id', (req, res) => {
  const products = readInventory();
  const id = parseInt(req.params.id);
  const updatedProducts = products.filter(p => p.id !== id);
  saveInventory(updatedProducts);
  res.status(204).send();
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
