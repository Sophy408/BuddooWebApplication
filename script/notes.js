"use strict"
// LocalStorage
let categories = JSON.parse(localStorage.getItem('categories')) || ['Math', 'Info', 'Personal'];
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// 📌 DOM-Elemente abrufen
const categoryList = document.getElementById('category-list');
const categoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');
const notesGrid = document.getElementById('notes-grid');
const addNoteBtn = document.getElementById('add-note-btn');

// 📂 Kategorien anzeigen (Sidebar)
function renderCategories() {
  categoryList.innerHTML = '';
  categories.forEach(cat => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.classList.add('category-btn');
    btn.textContent = cat;
    li.appendChild(btn);
    categoryList.appendChild(li);
  });
}

// Neue Kategorie hinzufügen
addCategoryBtn.addEventListener('click', () => {
  const newCat = categoryInput.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    localStorage.setItem('categories', JSON.stringify(categories));
    categoryInput.value = '';
    renderCategories();
  }
});

// 💾 Notiz speichern (Text + Kategorie)
function saveNote(index, newCategory, newText) {
  notes[index] = { category: newCategory, text: newText };
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

// ➕ Neue leere Notiz hinzufügen
addNoteBtn.addEventListener('click', () => {
  notes.push({ category: categories[0] || 'Uncategorized', text: '' });
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
});

// 🗒️ Notizen anzeigen (mit Dropdown & Textarea)
function renderNotes() {
  notesGrid.innerHTML = '';
  notes.forEach((note, index) => {
    const noteCard = document.createElement('div');
    noteCard.classList.add('note-card');

    // Dropdown mit Kategorien    
    const select = document.createElement('select');
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      if (cat === note.category) option.selected = true;
      select.appendChild(option);
    });


    // Textfeld für Notiz
    const textarea = document.createElement('textarea');
    textarea.value = note.text;

    // Speichern-Button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.classList.add('save-note-btn');

    // 🧠 Bei Klick neue Werte speichern
    saveBtn.addEventListener('click', () => {
      const selectedCat = select.value;
      const newText = textarea.value;
      saveNote(index, selectedCat, newText);
    });

    // 🧱 Bausteine zusammensetzen
    noteCard.appendChild(select);
    noteCard.appendChild(textarea);
    noteCard.appendChild(saveBtn);
    notesGrid.appendChild(noteCard);
  });
}

function deleteCategory(categoryToDelete) {
  // Filtert die Kategorie aus dem Array raus
  categories = categories.filter(cat => cat !== categoryToDelete);
  localStorage.setItem('categories', JSON.stringify(categories));

  // Alle Notizen, die diese Kategorie hatten, auf 'Uncategorized' setzen
  notes = notes.map(note => {
    if (note.category === categoryToDelete) {
      return { ...note, category: 'Uncategorized' };
    }
    return note;
  });
  localStorage.setItem('notes', JSON.stringify(notes));

  // UI neu laden
  renderCategories();
  renderNotes();
}

function deleteNote(indexToDelete) {
  // Entfernt die Notiz an dieser Stelle
  notes.splice(indexToDelete, 1);
  localStorage.setItem('notes', JSON.stringify(notes));

  // UI neu laden
  renderNotes();
}

const deleteBtn = document.createElement('button');
deleteBtn.textContent = '🗑️';
deleteBtn.classList.add('delete-note-btn');
deleteBtn.addEventListener('click', () => {
  deleteNote(index);
});
noteCard.appendChild(deleteBtn);


// 🔁 Beim Start alles anzeigen
renderCategories();
renderNotes();
