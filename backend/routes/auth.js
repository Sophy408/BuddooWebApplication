// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// Registrierung
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, hash]
    );
    res.status(201).json({ message: 'Registrierung erfolgreich' });
  } catch (err) {
    res.status(500).json({ error: 'Fehler bei der Registrierung' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) return res.status(401).json({ error: 'Nutzer nicht gefunden' });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Falsches Passwort' });

  req.session.userId = user.id;
  res.json({ message: 'Erfolgreich eingeloggt' });
});

// Auth-Check
router.get('/check', (req, res) => {
  if (req.session.userId) res.json({ loggedIn: true });
  else res.status(401).json({ loggedIn: false });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Ausgeloggt' });
  });
});

module.exports = router;
