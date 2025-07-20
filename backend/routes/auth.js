// Login
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
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Session starten oder Token zurückgeben
    req.session.userId = user.id;

    res.json({ message: 'Login erfolgreich', user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('❌ Fehler beim Login:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});
