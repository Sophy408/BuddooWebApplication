const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Pfade zu JSON-Dateien
const notesPath = path.join(__dirname, 'data.json');

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

// Notizen-Helper
function readNotes() {
  if (!fs.existsSync(notesPath)) {
    fs.writeFileSync(notesPath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(notesPath));
}

function writeNotes(notes) {
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
}

// Notizen-API
app.get('/notes', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Nicht eingeloggt' });
  }
  
  const notes = readNotes();
  const userNotes = notes.filter(note => note.userId === req.session.user.id);
  res.json(userNotes);
});

app.post('/notes', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Nicht eingeloggt' });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Titel und Inhalt erforderlich' });
  }

  const notes = readNotes();
  const newNote = {
    id: Date.now(),
    userId: req.session.user.id,
    title,
    content,
    createdAt: new Date().toISOString()
  };

  notes.push(newNote);
  writeNotes(notes);
  res.status(201).json(newNote);
});

app.delete('/notes/:id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Nicht eingeloggt' });
  }

  const notes = readNotes();
  const noteIndex = notes.findIndex(
    note => note.id === Number(req.params.id) && note.userId === req.session.user.id
  );

  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Notiz nicht gefunden' });
  }

  notes.splice(noteIndex, 1);
  writeNotes(notes);
  res.json({ message: 'Notiz gelöscht' });
});

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../Public')));

// Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
  console.log('Verfügbare Endpunkte:');
  console.log('POST   /api/register');
  console.log('POST   /api/login');
  console.log('POST   /api/logout');
  console.log('GET    /api/me');
  console.log('GET    /notes');
  console.log('POST   /notes');
  console.log('DELETE /notes/:id');
});