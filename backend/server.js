const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const usersRoutes = require('./routes/users');
const chatRoutes = require('./routes/chatController');
const transactionRoutes = require('./routes/transactions');
const searchItemsRoutes = require('./routes/searchItems'); // ✅

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api', usersRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api', searchItemsRoutes); // ✅ Tambah endpoint pencarian

app.get('/', (req, res) => {
  res.send('Mini Auth + Inventory API running');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
