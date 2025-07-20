const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'Public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public/html/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});
