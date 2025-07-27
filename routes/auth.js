const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersPath = path.join(__dirname, '../users.json');

// Testuser-Daten
const TEST_USER = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password: '$2b$10$W8gXZpW1w.yz8eO5V7vJX.9Xr6TkL8J9z1d2N3Y4Z5A6B7C8D9E0F' // "123456"
};

function readUsers() {
  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, JSON.stringify([TEST_USER]));
    return [TEST_USER];
  }
  
  const users = JSON.parse(fs.readFileSync(usersPath));
  if (users.length === 0) {
    users.push(TEST_USER);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
  
  return users;
}

function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const users = readUsers();
    if (users.some(user => user.email === email)) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({
      message: 'Registration successful',
      user: { id: newUser.id, username, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.json({ 
      message: 'Login successful', 
      user: req.session.user 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

module.exports = router;