const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 Stunden
  }
}));
app.use(morgan('dev'));

// Auth-Routen
app.use('/api', authRouter);

// Helper-Funktionen für Datenzugriff
function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Sessionprüfung
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Nicht eingeloggt' });
  }
  next();
}

// ✅ Alle Benutzerdaten lesen
app.get('/api/data', requireLogin, (req, res) => {
  const allData = readData();
  const userData = allData.find(entry => entry.userId === req.session.user.id);

  if (!userData) {
    return res.json({
      notes: [],
      todos: {},
      events: {}
    });
  }

  res.json({
    notes: userData.notes || [],
    todos: userData.todos || {},
    events: userData.events || {}
  });
});

// ✅ Alle Benutzerdaten speichern
app.post('/api/data', requireLogin, (req, res) => {
  const { notes = [], todos = {}, events = {} } = req.body;
  const allData = readData();

  const userIndex = allData.findIndex(entry => entry.userId === req.session.user.id);
  const newEntry = {
    userId: req.session.user.id,
    notes,
    todos,
    events
  };

  if (userIndex === -1) {
    allData.push(newEntry);
  } else {
    allData[userIndex] = newEntry;
  }

  writeData(allData);
  res.json({ message: 'Daten gespeichert' });
});

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, 'Public')));

// Weiterleitung von '/' zur Login-Seite
app.get('/', (req, res) => {
  res.redirect('/html/index.html');
});

// Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

// 404-Fallback
app.use((req, res) => {
  res.status(404).send('Seite nicht gefunden');
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
  console.log('Verfügbare Endpunkte:');
  console.log('POST   /api/register');
  console.log('POST   /api/login');
  console.log('POST   /api/logout');
  console.log('GET    /api/me');
  console.log('GET    /api/data');
  console.log('POST   /api/data');
});
