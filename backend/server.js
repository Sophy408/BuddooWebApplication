const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'supergeheim',
  resave: false,
  saveUninitialized: false,
}));

// Statische Dateien
app.use(express.static(path.join(__dirname, '../public')));

// Auth-Routen
app.use('/api/auth', authRoutes);

// Zugriffsschutz
app.use((req, res, next) => {
  if (req.session.userId || req.path === '/html/login.html' || req.path.startsWith('/api')) {
    next();
  } else {
    res.redirect('/html/login.html');
  }
});

// Start
app.listen(3000, () => console.log('Server läuft auf http://localhost:3000'));
