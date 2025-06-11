const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../data/history_transactions.json');

// Utility: Load transactions from file
const loadTransactions = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read transaction data:', err);
    return [];
  }
};

// Utility: Save transactions to file
const saveTransactions = (transactions) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(transactions, null, 2));
  } catch (err) {
    console.error('Failed to save transaction data:', err);
  }
};

// GET all transactions
router.get('/', (req, res) => {
  const transactions = loadTransactions();
  res.json(transactions);
});

// POST new transaction
router.post('/', (req, res) => {
  const { date, type, item, quantity, notes } = req.body;

  if (!date || !type || !item || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newTransaction = {
    id: Date.now(),
    date,
    type,
    item,
    quantity,
    notes: notes || '',
  };

  const transactions = loadTransactions();
  transactions.unshift(newTransaction);
  saveTransactions(transactions);

  res.status(201).json(newTransaction);
});

module.exports = router;
