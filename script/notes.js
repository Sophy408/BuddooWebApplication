"use strict";

// LocalStorage laden
let categories = JSON.parse(localStorage.getItem('categories')) || ['Math', 'Info', 'Personal'];
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// ✅ Default Category & Default Note nur wenn nichts da ist
if (categories.length === 0) {
  categories.push('Click here to create your first Category🍃');
  localStorage.setItem('categories', JSON.stringify(categories));
}

if (notes.length === 0) {
  notes.push({
    category: 'General',
    text: '',
    fontSize: '14px',
    isBold: false,
    isItalic: false
  });
  localStorage.setItem('notes', JSON.stringify(notes));
}

// 📌 DOM-Elemente
const categoryList = document.getElementById('category-list');
const categoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');
const notesGrid = document.getElementById('notes-grid');
const addNoteBtn = document.getElementById('add-note-btn');
const linedToggle = document.getElementById('lined-toggle');

// Kategorien anzeigen
function renderCategories() {
  categoryList.innerHTML = '';
  categories.forEach(cat => {
    const li = document.createElement('li');
    li.classList.add('category-item');

    const btn = document.createElement('button');
    btn.classList.add('category-btn');
    btn.textContent = cat;

    
    // 🆕 Bearbeiten per Klick
    btn.addEventListener('click', () => {
      const newName = prompt("Edit category name:", cat);
      if (newName && newName.trim() !== "" && !categories.includes(newName.trim())) {
        const index = categories.indexOf(cat);
        categories[index] = newName.trim();
        localStorage.setItem('categories', JSON.stringify(categories));
        renderCategories();
        renderNotes();

      }
    });

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '🗑️';
    delBtn.classList.add('delete-category-btn');
    delBtn.title = 'Delete category';
    delBtn.addEventListener('click', () => {
      deleteCategory(cat);
    });

    li.appendChild(btn);
    li.appendChild(delBtn);
    categoryList.appendChild(li);
  });

  updateCategoryFilterOptions(); // ← Dropdown wird aktualisiert
}

function updateCategoryFilterOptions() {
  const filterSelect = document.getElementById('categoryFilter');
  const selectedCategory = filterSelect ? filterSelect.value : 'all';
  filterSelect.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filterSelect.appendChild(option);
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
    renderNotes(); // 🆕 HIER!
    document.getElementById('categoryFilter').value = 'all'; // ← Reset Filter


  }
});

// Enter-Taste zum Hinzufügen einer Kategorie
categoryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const newCat = categoryInput.value.trim();
    if (newCat && !categories.includes(newCat)) {
      categories.push(newCat);
      localStorage.setItem('categories', JSON.stringify(categories));
      categoryInput.value = '';
      renderCategories();
      renderNotes(); // 🆕 HIER AUCH!
      document.getElementById('categoryFilter').value = 'all';
    }
  }
});



// Notiz speichern
function saveNote(index, newCategory, newText, fontSize, isBold, isItalic) {
  notes[index] = { 
    category: newCategory, 
    text: newText, 
    fontSize: fontSize, 
    isBold: isBold, 
    isItalic: isItalic
  };
  localStorage.setItem('notes', JSON.stringify(notes));
}


// Neue Notiz hinzufügen
addNoteBtn.addEventListener('click', () => {
  const selectedCategory = document.getElementById('categoryFilter').value;
  

  // Wenn eine spezifische Kategorie gefiltert ist, soll diese auch übernommen werden
  let noteCategory = selectedCategory;

  // Wenn NICHTS gefiltert → Nutzer darf später selbst auswählen
  if (selectedCategory === 'all') {
    noteCategory = ''; // leer lassen, Nutzer soll selbst auswählen in Dropdown
  }

  
  const newNote = {
    category: selectedCategory !== 'all' ? selectedCategory : '',
    text: '',
    fontSize: '14px',
    isBold: false,
    isItalic: false
  };
  notes.push(newNote);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
});


// Notizen anzeigen
function renderNotes() {
  notesGrid.innerHTML = '';
  const selectedCategory = document.getElementById('categoryFilter').value;


  notes.forEach((note, index) => {
    if (selectedCategory !== 'all' && note.category !== selectedCategory) return;
    
    const noteCard = document.createElement('div');
    noteCard.classList.add('note-card');

    // Kategorie Auswahl
    const select = document.createElement('select');
    
const placeholderOption = document.createElement('option');
placeholderOption.textContent = 'Choose Your Category';
placeholderOption.value = '';
placeholderOption.disabled = true;
select.appendChild(placeholderOption);

// Append category options
categories.forEach(cat => {
  const option = document.createElement('option');
  option.value = cat;
  option.textContent = cat;
  select.appendChild(option);
});

// Set selected value — now '' will select the placeholder!
select.value = note.category;


    // Formatierungs-Toolbar
    const toolbar = document.createElement('div');
    toolbar.classList.add('note-toolbar');

    const boldBtn = document.createElement('button');
    boldBtn.textContent = 'B';
    boldBtn.addEventListener('click', () => {
      textarea.style.fontWeight = textarea.style.fontWeight === 'bold' ? 'normal' : 'bold';
    });

    const italicBtn = document.createElement('button');
    italicBtn.textContent = 'I';
    italicBtn.addEventListener('click', () => {
      textarea.style.fontStyle = textarea.style.fontStyle === 'italic' ? 'normal' : 'italic';
    });

    const fontSizeSelect = document.createElement('select');
    ['12px', '14px', '16px', '18px', '20px'].forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      fontSizeSelect.appendChild(option);
    });

    fontSizeSelect.addEventListener('change', () => {
      textarea.style.fontSize = fontSizeSelect.value;
    });

    toolbar.appendChild(boldBtn);
    toolbar.appendChild(italicBtn);
    toolbar.appendChild(fontSizeSelect);
    noteCard.appendChild(toolbar);

    // Textarea
    const textarea = document.createElement('textarea');
    textarea.value = note.text;
    textarea.style.backgroundImage = 'repeating-linear-gradient(white, white 24px, #ddd 25px)';  // 🆕 Immer liniert
    textarea.style.fontSize = note.fontSize || '14px';
    textarea.style.fontWeight = note.isBold ? 'bold' : 'normal';
    textarea.style.fontStyle = note.isItalic ? 'italic' : 'normal';


    // Buttons
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('note-btn-container');

  const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.classList.add('note-action-btn','save-note-btn');
    saveBtn.addEventListener('click', () => {
      const selectedCat = select.value;
      const newText = textarea.value;
      const fontSize = textarea.style.fontSize || '14px';
      const isBold = textarea.style.fontWeight === 'bold';
      const isItalic = textarea.style.fontStyle === 'italic';

      const currentFilter = document.getElementById('categoryFilter').value;
  if (currentFilter !== 'all' && selectedCat !== currentFilter) {
    alert(`Please select the filtered category: ${currentFilter}`);
    return;
  }

  saveNote(index, selectedCat, newText, fontSize, isBold, isItalic);

  // ➕ Button-Änderung
  saveBtn.classList.add('saved');
  saveBtn.textContent = '✅ Saved';

  // ➕ Zurück nach 1,5 Sekunden
  setTimeout(() => {
    saveBtn.classList.remove('saved');
    saveBtn.textContent = 'Save';
  }, 2000);
});


    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.classList.add('note-action-btn','delete-note-btn');
    deleteBtn.title = 'Delete note';
    deleteBtn.addEventListener('click', () => {
      deleteNote(index);
    });

    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '⬇️';
    downloadBtn.classList.add('note-action-btn','download-note-btn');
    downloadBtn.title = 'Download PDF';
    downloadBtn.addEventListener('click', () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const noteData = notes[index];
      const fontSize = parseInt(noteData.fontSize) || 14;
      doc.setFontSize(fontSize);

      let fontStyle = 'normal';
      if (noteData.isBold && noteData.isItalic) fontStyle = 'bolditalic';
      else if (noteData.isBold) fontStyle = 'bold';
      else if (noteData.isItalic) fontStyle = 'italic';

      doc.setFont(undefined, fontStyle);

      const noteContent = `Category: ${noteData.category}\n\n${noteData.text}`;
      doc.text(noteContent, 10, 10);
      doc.save(`Note_${index + 1}.pdf`);
  });


    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(deleteBtn);
    btnContainer.appendChild(downloadBtn);

    // Alles zusammenbauen
    noteCard.appendChild(select);
    noteCard.appendChild(textarea);
    noteCard.appendChild(btnContainer);
    notesGrid.appendChild(noteCard);
  });
}



// Kategorie löschen
function deleteCategory(categoryToDelete) {
  categories = categories.filter(cat => cat !== categoryToDelete);
  localStorage.setItem('categories', JSON.stringify(categories));

  notes = notes.map(note => {
    if (note.category === categoryToDelete) {
      return { ...note, category: 'Uncategorized' };
    }
    return note;
  });
  localStorage.setItem('notes', JSON.stringify(notes));

  renderCategories();
  renderNotes();
}

// Notiz löschen
function deleteNote(indexToDelete) {
  notes.splice(indexToDelete, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

// Initial render
renderCategories();
renderNotes();

// 🆕 Filter nach Kategorie anwenden, wenn Auswahl sich ändert
document.getElementById('categoryFilter').addEventListener('change', renderNotes);

