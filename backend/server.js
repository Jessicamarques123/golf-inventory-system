const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => res.redirect('/login.html'));

const DATA_FILE = './inventory.json';
const SALES_FILE = './sales.json';

// Funções utilitárias
function readInventory() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading inventory.json:', err.message);
    return [];
  }
}

function saveInventory(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving inventory.json:', err.message);
  }
}

function readSales() {
  try {
    const data = fs.readFileSync(SALES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading sales.json:', err.message);
    return [];
  }
}

function saveSales(data) {
  try {
    fs.writeFileSync(SALES_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving sales.json:', err.message);
  }
}

// GET - Lista todos os produtos
app.get('/products', (req, res) => {
  const products = readInventory();
  res.json(products);
});

// POST - Adiciona novo produto (verifica código duplicado)
app.post('/products', (req, res) => {
  const products = readInventory();
  const newProduct = req.body;

  // Impede código duplicado
  if (products.some(p => p.code === newProduct.code)) {
    return res.status(400).json({ error: 'Product code already exists.' });
  }

  newProduct.id = Date.now();
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

// PUT - Atualiza produto (impede alterar para um código já existente)
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  const updatedData = req.body;
  let products = readInventory();
  const index = products.findIndex(p => parseInt(p.id) === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Se for trocar o código, verifica se já existe em outro produto
  if (
    updatedData.code &&
    products.some(p => p.code === updatedData.code && p.id !== id)
  ) {
    return res.status(400).json({ error: 'Product code already exists.' });
  }

  products[index] = { ...products[index], ...updatedData, id };
  saveInventory(products);
  res.json(products[index]);
});

// POST - Registrar venda de múltiplos produtos
app.post('/sales', (req, res) => {
  const { items, method, cashGiven } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items in the sale.' });
  }

  const products = readInventory();
  const sales = readSales();
  const saleDetails = [];
  let total = 0;

  for (const item of items) {
    const { productCode, quantity } = item;

    const product = products.find(p => p.code === productCode);
    if (!product) {
      return res.status(404).json({ error: `Product ${productCode} not found.` });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ error: `Not enough stock for ${product.name}.` });
    }

    // Atualiza estoque
    product.quantity -= quantity;

    saleDetails.push({
      code: product.code,
      name: product.name,
      quantity,
      price: product.price,
      subtotal: quantity * product.price
    });

    total += quantity * product.price;
  }

  saveInventory(products);

  // Registra a venda
  const newSale = {
    id: Date.now(),
    date: new Date().toISOString(),
    method,
    cashGiven: method === 'cash' ? cashGiven : null,
    total,
    items: saleDetails
  };

  sales.push(newSale);
  saveSales(sales);

  res.status(201).json({ message: 'Sale registered.', sale: newSale });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
