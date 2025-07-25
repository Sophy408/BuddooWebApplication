const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// ✅ REGISTRIERUNG
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
  }

  try {
    // Prüfen, ob der Nutzer schon existiert
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'E-Mail ist bereits registriert' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nutzer speichern
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'Registrierung erfolgreich', user: newUser.rows[0] });
  } catch (err) {
    console.error('❌ Fehler bei der Registrierung:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
  }

  try {
    // Benutzer anhand der E-Mail finden
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const user = result.rows[0];

    // Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Session speichern
    req.session.userId = user.id;

    res.json({ message: 'Login erfolgreich', user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('❌ Fehler beim Login:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// (Optional) ✅ LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Fehler beim Logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout erfolgreich' });
  });
});

module.exports = router;
