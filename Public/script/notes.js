"use strict";

// =============================================
// SERVER DATA MANAGEMENT (FETCH API)
// =============================================
fetch('/api/me', {
  method: 'GET',
  credentials: 'include'
})
.then(res => {
  if (!res.ok) throw new Error();
  return res.json();
})
.then(user => {
  console.log("👤 Eingeloggt als:", user.username);
})
.catch(() => {
  window.location.href = "/html/index.html";
});


let notes = [];
let categories = [];

async function loadNotesData() {
  try {
    const res = await fetch('/api/data', { credentials: 'include' });
    if (!res.ok) throw new Error('Nicht eingeloggt');
    const json = await res.json();
    notes = json.notes || [];

    // Kategorien aus den Notizen ableiten
    const allCats = new Set();
    notes.forEach(n => n.category && allCats.add(n.category));
    categories = [...allCats];
    if (categories.length === 0) categories = ['Personal'];

    renderCategories();
    renderNotes();
  } catch (err) {
    console.error('Fehler beim Laden der Notizen:', err);
    window.location.href = '/html/index.html';
  }
}

async function saveNotesData() {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ notes })
    });

    if (!res.ok) throw new Error('Speichern fehlgeschlagen');
    console.log('✅ Notizen gespeichert');
  } catch (err) {
    console.error('Fehler beim Speichern der Notizen:', err);
  }
}

// =============================================
// DOM ELEMENTS
// =============================================
const categoryList = document.getElementById('category-list');
const categoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');
const notesGrid = document.getElementById('notes-grid');
const addNoteBtn = document.getElementById('add-note-btn');
const categoryFilter = document.getElementById('categoryFilter');

// =============================================
// CATEGORY FUNCTIONS
// =============================================
function renderCategories() {
  categoryList.innerHTML = '';

  categories.forEach(cat => {
    const li = document.createElement('li');
    li.classList.add('category-item');

    const btn = document.createElement('button');
    btn.classList.add('category-btn');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      const newName = prompt("Edit category name:", cat);
      if (newName && newName.trim() !== "" && !categories.includes(newName.trim())) {
        const index = categories.indexOf(cat);
        categories[index] = newName.trim();
        notes.forEach(n => {
          if (n.category === cat) n.category = newName.trim();
        });
        saveNotesData();
        renderCategories();
        renderNotes();
      }
    });

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '🗑️';
    delBtn.classList.add('delete-category-btn');
    delBtn.title = 'Delete category';
    delBtn.addEventListener('click', () => {
      const hasAssigned = notes.some(n => n.category === cat);
      if (hasAssigned) {
        alert(`⚠️ You cannot delete the category "${cat}" because there are still notes assigned to it.`);
      } else {
        categories = categories.filter(c => c !== cat);
        renderCategories();
        saveNotesData();
      }
    });

    li.appendChild(btn);
    li.appendChild(delBtn);
    categoryList.appendChild(li);
  });

  updateCategoryFilterOptions();
}

function updateCategoryFilterOptions() {
  const selected = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = selected;
}

// =============================================
// NOTE FUNCTIONS
// =============================================
function saveNote(index, newCategory, newText, fontSize, isBold, isItalic) {
  notes[index] = { category: newCategory, text: newText, fontSize, isBold, isItalic };
  saveNotesData();
}

function deleteNote(index) {
  notes.splice(index, 1);
  saveNotesData();
  renderNotes();
}

function renderNotes() {
  notesGrid.innerHTML = '';
  const selected = categoryFilter.value;

  notes.forEach((note, index) => {
    if (selected !== 'all' && note.category !== selected) return;
    notesGrid.appendChild(createNoteCard(note, index));
  });
}

function createNoteCard(note, index) {
  const card = document.createElement('div');
  card.classList.add('note-card');

  const select = createCategorySelect(note);
  const toolbar = createFormatToolbar(note);
  const textarea = createNoteTextarea(note);
  const buttons = createActionButtons(note, index, select, textarea);

  card.appendChild(toolbar);
  card.appendChild(select);
  card.appendChild(textarea);
  card.appendChild(buttons);

  return card;
}

function createCategorySelect(note) {
  const select = document.createElement('select');
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
  select.value = note.category || '';
  return select;
}

function createFormatToolbar(note) {
  const toolbar = document.createElement('div');
  toolbar.classList.add('note-toolbar');

  const boldBtn = document.createElement('button');
  boldBtn.textContent = 'B';
  boldBtn.addEventListener('click', (e) => {
    const ta = e.target.closest('.note-card').querySelector('textarea');
    ta.style.fontWeight = ta.style.fontWeight === 'bold' ? 'normal' : 'bold';
  });

  const italicBtn = document.createElement('button');
  italicBtn.textContent = 'I';
  italicBtn.addEventListener('click', (e) => {
    const ta = e.target.closest('.note-card').querySelector('textarea');
    ta.style.fontStyle = ta.style.fontStyle === 'italic' ? 'normal' : 'italic';
  });

  const fontSizeSelect = document.createElement('select');
  ['12px', '14px', '16px', '18px', '20px'].forEach(size => {
    const opt = document.createElement('option');
    opt.value = size;
    opt.textContent = size;
    fontSizeSelect.appendChild(opt);
  });
  fontSizeSelect.value = note.fontSize || '14px';
  fontSizeSelect.addEventListener('change', e => {
    e.target.closest('.note-card').querySelector('textarea').style.fontSize = e.target.value;
  });

  toolbar.appendChild(boldBtn);
  toolbar.appendChild(italicBtn);
  toolbar.appendChild(fontSizeSelect);
  return toolbar;
}

function createNoteTextarea(note) {
  const ta = document.createElement('textarea');
  ta.value = note.text;
  ta.style.fontSize = note.fontSize || '14px';
  ta.style.fontWeight = note.isBold ? 'bold' : 'normal';
  ta.style.fontStyle = note.isItalic ? 'italic' : 'normal';
  return ta;
}

function createActionButtons(note, index, select, textarea) {
  const container = document.createElement('div');
  container.classList.add('note-btn-container');

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', () => {
    const cat = select.value;
    const txt = textarea.value;
    const fontSize = textarea.style.fontSize;
    const isBold = textarea.style.fontWeight === 'bold';
    const isItalic = textarea.style.fontStyle === 'italic';
    saveNote(index, cat, txt, fontSize, isBold, isItalic);
    saveBtn.textContent = '✅ Saved';
    setTimeout(() => (saveBtn.textContent = 'Save'), 1500);
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = '🗑️';
  delBtn.addEventListener('click', () => {
    if (confirm('Delete this note?')) deleteNote(index);
  });

  container.appendChild(saveBtn);
  container.appendChild(delBtn);
  return container;
}

// =============================================
// EVENT LISTENERS
// =============================================

addCategoryBtn?.addEventListener('click', () => {
  const newCat = categoryInput.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    categoryInput.value = '';
    renderCategories();
    saveNotesData();
  }
});

addNoteBtn?.addEventListener('click', () => {
  const cat = categoryFilter.value;
  notes.push({ category: cat !== 'all' ? cat : '', text: '', fontSize: '14px', isBold: false, isItalic: false });
  saveNotesData();
  renderNotes();
});

categoryFilter?.addEventListener('change', renderNotes);

// =============================================
// INITIALIZE
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/me', {
    method: 'GET',
    credentials: 'include'
  })
  .then(res => {
    if (!res.ok) throw new Error('Nicht eingeloggt');
    return res.json();
  })
  .then(user => {
    console.log("👤 Eingeloggt als:", user.username);
    loadNotesData(); // Jetzt erst laden
  })
  .catch(() => {
    window.location.href = "/html/index.html";
  });
});

//Hallooo