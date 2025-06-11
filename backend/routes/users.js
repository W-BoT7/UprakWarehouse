const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcryptjs');

const USERS_FILE = './data/users.json';

const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

router.get('/users', (req, res) => {
  const users = readUsers();
  const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPassword);
});

router.post('/users', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Username, email, password, and role are required' });
  }

  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    username,
    email,
    password: hashedPassword,
    role,
  };

  users.push(newUser);
  writeUsers(users);

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json(userWithoutPassword);
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (username && users.some((u, idx) => u.username === username && idx !== userIndex)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  if (email && users.some((u, idx) => u.email === email && idx !== userIndex)) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  let hashedPassword = users[userIndex].password;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  users[userIndex] = {
    ...users[userIndex],
    username: username || users[userIndex].username,
    email: email || users[userIndex].email,
    password: hashedPassword,
    role: role || users[userIndex].role,
  };

  writeUsers(users);

  const { password: _, ...userWithoutPassword } = users[userIndex];

  res.json(userWithoutPassword);
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  let users = readUsers();

  const userExists = users.some(u => u.id === parseInt(id));
  if (!userExists) {
    return res.status(404).json({ message: 'User not found' });
  }

  users = users.filter(u => u.id !== parseInt(id));
  writeUsers(users);

  res.json({ message: 'User deleted' });
});

module.exports = router;
