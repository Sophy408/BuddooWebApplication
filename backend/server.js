const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session-Konfiguration (secure nur bei HTTPS!)
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' // Nur bei HTTPS aktiv
  }
}));

// API-Routen
app.use('/api/auth', authRoutes);

// 🟢 Statische Dateien bereitstellen (Public-Ordner)
app.use(express.static(path.join(__dirname, '../Public')));

// 🟢 Standard-Route: Home laden
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Public/html/index.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});
