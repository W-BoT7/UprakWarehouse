const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const inventoryPath = path.join(__dirname, '../data/inventory.json');
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(inventoryPath)) fs.writeFileSync(inventoryPath, '[]');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

const loadItems = () => {
  const raw = fs.readFileSync(inventoryPath, 'utf-8');
  return JSON.parse(raw || '[]');
};

const saveItems = (items) => {
  fs.writeFileSync(inventoryPath, JSON.stringify(items, null, 2));
};

router.get('/', (req, res) => {
  const items = loadItems();
  res.json(items);
});

router.post('/', upload.single('image'), (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  const items = loadItems();

  const newItem = {
    id: Date.now(),
    name: name.trim(),
    price: parseFloat(price),
    description: description || '',
    createdAt: new Date().toISOString(),
    imageUrl: req.file ? req.file.filename : null
  };

  items.push(newItem);
  saveItems(items);
  res.status(201).json(newItem);
});

router.put('/:id', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);
  const items = loadItems();
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const existingItem = items[index];

  const updatedItem = {
    ...existingItem,
    name: req.body.name?.trim() || existingItem.name,
    price: parseFloat(req.body.price) || existingItem.price,
    description: req.body.description || existingItem.description,
    imageUrl: req.file ? req.file.filename : existingItem.imageUrl,
  };

  items[index] = updatedItem;
  saveItems(items);
  res.json(updatedItem);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let items = loadItems();
  const item = items.find(i => i.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  items = items.filter(i => i.id !== id);
  saveItems(items);
  res.json({ message: 'Item deleted successfully' });
});

module.exports = router;
