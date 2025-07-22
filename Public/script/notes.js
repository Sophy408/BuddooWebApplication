/**
 * BUDDOO NOTES MODULE  
 * Handles creating, saving, editing, and deleting notes  
 */

"use strict";

// =============================================
// DATA MANAGEMENT
// =============================================

// Load data from localStorage or initialize with defaults
let categories = JSON.parse(localStorage.getItem('categories')) || ['Math', 'Info', 'Personal'];
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Set default category and note if none exist
if (categories.length === 0) {
  categories.push('Click here to create your first Category🍃');
  localStorage.setItem('categories', JSON.stringify(categories));
}

if (notes.length === 0) {
  notes.push({
    category: '', // Empty to show placeholder
    text: '',
    fontSize: '14px',
    isBold: false,
    isItalic: false
  });
  
  // Mark that the page has been visited
  localStorage.setItem('visitedNotesPage', 'true');
  localStorage.setItem('notes', JSON.stringify(notes));
}

// =============================================
// DOM ELEMENTS
// =============================================
const categoryList = document.getElementById('category-list');
const categoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');
const notesGrid = document.getElementById('notes-grid');
const addNoteBtn = document.getElementById('add-note-btn');
const linedToggle = document.getElementById('lined-toggle');
const categoryFilter = document.getElementById('categoryFilter');

// =============================================
// CATEGORY FUNCTIONS
// =============================================

/**
 * Render all categories to the DOM
 */
function renderCategories() {
  categoryList.innerHTML = '';
  
  categories.forEach(cat => {
    const li = document.createElement('li');
    li.classList.add('category-item');

    // Category button
    const btn = document.createElement('button');
    btn.classList.add('category-btn');
    btn.textContent = cat;
    
    // Edit category on click
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

    // Delete button category
    const delBtn = document.createElement('button');
    delBtn.innerHTML = '🗑️';
    delBtn.classList.add('delete-category-btn');
    delBtn.title = 'Delete category';
    delBtn.addEventListener('click', () => {
      // Check if any notes are assigned to this category
      const hasAssignedNotes = notes.some(note => note.category === cat);

      if (hasAssignedNotes) {
        alert(`⚠️ You cannot delete the category "${cat}" because there are still notes assigned to it.`);
      } else {
        const confirmDelete = confirm(`Do you really want to delete the category "${cat}"?`);
        if (confirmDelete) {
          deleteCategory(cat); // ← only delete if confirmed and no notes are assigned
        }
      }
    });

    li.appendChild(btn);
    li.appendChild(delBtn);
    categoryList.appendChild(li);
  });

  updateCategoryFilterOptions();
}

/**
 * Update the category filter dropdown options
 */
function updateCategoryFilterOptions() {
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

/**
 * Delete a category and update related notes
 */
function deleteCategory(categoryToDelete) {
  categories = categories.filter(cat => cat !== categoryToDelete);
  localStorage.setItem('categories', JSON.stringify(categories));

  // Update notes with deleted category
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

// =============================================
// NOTE FUNCTIONS
// =============================================

/**
 * Save a note to localStorage
 */
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

/**
 * Delete a note
 */
function deleteNote(indexToDelete) {
  notes.splice(indexToDelete, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

/**
 * Render all notes to the DOM
 */
function renderNotes() {
  notesGrid.innerHTML = '';
  const selectedCategory = categoryFilter.value;

  notes.forEach((note, index) => {
    // Skip if filtered and doesn't match
    if (selectedCategory !== 'all' && note.category !== selectedCategory) return;
    
    const noteCard = createNoteCard(note, index);
    notesGrid.appendChild(noteCard);
  });
}

/**
 * Create a note card element
 */
function createNoteCard(note, index) {
  const noteCard = document.createElement('div');
  noteCard.classList.add('note-card');

  // Create category select dropdown
  const select = createCategorySelect(note);
  
  // Create formatting toolbar
  const toolbar = createFormatToolbar(note);
  
  // Create textarea
  const textarea = createNoteTextarea(note);
  
  // Create action buttons
  const btnContainer = createActionButtons(note, index, select, textarea);

  noteCard.appendChild(toolbar);
  noteCard.appendChild(select);
  noteCard.appendChild(textarea);
  noteCard.appendChild(btnContainer);
  
  return noteCard;
}

/**
 * Create category select dropdown
 */
function createCategorySelect(note) {
  const select = document.createElement('select');

  // Add placeholder option for first visit
  if (!localStorage.getItem('visitedNotesPage') && !note.category) {
    const placeholderOption = document.createElement('option');
    placeholderOption.textContent = 'Choose Your Category';
    placeholderOption.value = '';
    placeholderOption.disabled = true;
    placeholderOption.selected = !note.category;
    select.appendChild(placeholderOption);
  }

  // Add category options
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Set selected value if exists
  if (note.category) {
    select.value = note.category;
  }

  return select;
}

/**
 * Create formatting toolbar
 */
function createFormatToolbar(note) {
  const toolbar = document.createElement('div');
  toolbar.classList.add('note-toolbar');

  // Bold button
  const boldBtn = document.createElement('button');
  boldBtn.textContent = 'B';
  boldBtn.addEventListener('click', (e) => {
    const textarea = e.target.closest('.note-card').querySelector('textarea');
    textarea.style.fontWeight = textarea.style.fontWeight === 'bold' ? 'normal' : 'bold';
  });

  // Italic button
  const italicBtn = document.createElement('button');
  italicBtn.textContent = 'I';
  italicBtn.addEventListener('click', (e) => {
    const textarea = e.target.closest('.note-card').querySelector('textarea');
    textarea.style.fontStyle = textarea.style.fontStyle === 'italic' ? 'normal' : 'italic';
  });

  // Font size selector
  const fontSizeSelect = document.createElement('select');
  ['12px', '14px', '16px', '18px', '20px'].forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = size;
    fontSizeSelect.appendChild(option);
  });

  fontSizeSelect.addEventListener('change', (e) => {
    e.target.closest('.note-card').querySelector('textarea').style.fontSize = e.target.value;
  });

  toolbar.appendChild(boldBtn);
  toolbar.appendChild(italicBtn);
  toolbar.appendChild(fontSizeSelect);
  return toolbar;
}

/**
 * Create note textarea
 */
function createNoteTextarea(note) {
  const textarea = document.createElement('textarea');
  textarea.value = note.text;
  textarea.style.backgroundImage = 'repeating-linear-gradient(white, white 24px, #ddd 25px)';
  textarea.style.fontSize = note.fontSize || '14px';
  textarea.style.fontWeight = note.isBold ? 'bold' : 'normal';
  textarea.style.fontStyle = note.isItalic ? 'italic' : 'normal';
  return textarea;
}

/**
 * Create action buttons for a note
 */
function createActionButtons(note, index, select, textarea) {
  const btnContainer = document.createElement('div');
  btnContainer.classList.add('note-btn-container');

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.classList.add('note-action-btn', 'save-note-btn');
  saveBtn.addEventListener('click', () => {
    const selectedCat = select.value;
    const newText = textarea.value;
    const fontSize = textarea.style.fontSize || '14px';
    const isBold = textarea.style.fontWeight === 'bold';
    const isItalic = textarea.style.fontStyle === 'italic';

    // Validate if filtered category matches
    const currentFilter = categoryFilter.value;
    if (currentFilter !== 'all' && selectedCat !== currentFilter) {
      alert(`Please select the filtered category: ${currentFilter}`);
      return;
    }

    saveNote(index, selectedCat, newText, fontSize, isBold, isItalic);

    // Show save feedback
    saveBtn.classList.add('saved');
    saveBtn.textContent = '✅ Saved';

    setTimeout(() => {
      saveBtn.classList.remove('saved');
      saveBtn.textContent = 'Save';
    }, 2000);
  });

  // Delete button note
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.classList.add('note-action-btn', 'delete-note-btn');
  deleteBtn.title = 'Delete note';
  deleteBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(index); // <- deine Funktion
    }
  });

  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.innerHTML = '⬇️';
  downloadBtn.classList.add('note-action-btn', 'download-note-btn');
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
    doc.text(`Category: ${noteData.category}\n\n${noteData.text}`, 10, 10);
    doc.save(`Note_${index + 1}.pdf`);
  });

  btnContainer.appendChild(saveBtn);
  btnContainer.appendChild(deleteBtn);
  btnContainer.appendChild(downloadBtn);
  return btnContainer;
}

// =============================================
// EVENT LISTENERS
// =============================================

// Add category button
addCategoryBtn.addEventListener('click', () => {
  const newCat = categoryInput.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    localStorage.setItem('categories', JSON.stringify(categories));
    categoryInput.value = '';
    renderCategories();
    renderNotes();
    categoryFilter.value = 'all';
  }
});

// Add category on Enter key
categoryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addCategoryBtn.click();
  }
});

// Add new note button
addNoteBtn.addEventListener('click', () => {
  const selectedCategory = categoryFilter.value;
  
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

// Burger menu functionality
const burgerMenu = document.getElementById('burger-menu');
const sidebar = document.querySelector('.sidebar');

burgerMenu.addEventListener('click', () => {
  burgerMenu.classList.toggle('open');
  sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    const isClickInsideSidebar = sidebar.contains(e.target);
    const isClickOnBurger = burgerMenu.contains(e.target);
    
    if (!isClickInsideSidebar && !isClickOnBurger && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      burgerMenu.classList.remove('open');
    }
  }
});

// Filter notes by category
categoryFilter.addEventListener('change', renderNotes);

// =============================================
// INITIAL RENDER
// =============================================
renderCategories();
renderNotes();