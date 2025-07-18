router.get('/check', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, hashed],
    (err) => {
      if (err) return res.status(400).json({ error: 'Fehler beim Registrieren' });
      res.status(201).json({ message: 'Erfolgreich registriert' });
    });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Ungültige Daten' });

    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) return res.status(401).json({ error: 'Falsches Passwort' });

    req.session.userId = user.id;
    res.json({ message: 'Login erfolgreich', username: user.username });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logout erfolgreich' });
  });
});

module.exports = router;
