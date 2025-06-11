require('dotenv').config();

const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in your .env file');
}

const USERS_FILE = './data/users.json';
const ADMIN_CODE = 'admin2420@';
const STAFF_CODE = 'staff2024@';

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

router.post('/signup', async (req, res) => {
  const { username, email, password, roleCode } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }

  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let role = 'user';
  if (roleCode === ADMIN_CODE) role = 'admin';
  else if (roleCode === STAFF_CODE) role = 'staff';

  const newUser = {
    id: Date.now(),
    username,
    email,
    password: hashedPassword,
    role,
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: 'User registered successfully', role });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });

  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) return res.status(400).json({ message: 'Invalid username or password' });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, username: user.username, role: user.role });
});

module.exports = router;
