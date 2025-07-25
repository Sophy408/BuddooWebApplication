/**
 * BUDDOO EVENTS MODULE
 * Handles assignments, appointments, and calendar functionality
 */

// ======================
// DATA MANAGEMENT
// ======================

"use strict";

// Data structure for storing all events
const data = {
    assignments: [],
    appointments: [],
    calendarEvents: []
};

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem('buddooData');
    if (stored) {
        const parsed = JSON.parse(stored);
        data.assignments = parsed.assignments || [];
        data.appointments = parsed.appointments || [];
        data.calendarEvents = parsed.calendarEvents || [];
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('buddooData', JSON.stringify(data));
}

// ======================
// CRUD OPERATIONS
// ======================

// Add new entry
function addEntry(type, title, date) {
    const entry = {
        id: Date.now(),
        title,
        date,
        type,
        completed: false
    };

    if (type === 'assignment') data.assignments.push(entry);
    if (type === 'appointment') data.appointments.push(entry);

    data.calendarEvents.push(entry);
    saveData();
    renderEntries();
    renderCalendar();
}

// Toggle completion status
function toggleCompletion(type, id) {
    const list = type === 'assignment' ? data.assignments : data.appointments;
    const entry = list.find(e => e.id === id);
    if (entry) {
        entry.completed = !entry.completed;
        saveData();
        renderEntries();
    }
}

// Delete an entry
function deleteEntry(type, id) {
    data.assignments = data.assignments.filter(e => !(type === 'assignment' && e.id === id));
    data.appointments = data.appointments.filter(e => !(type === 'appointment' && e.id === id));
    data.calendarEvents = data.calendarEvents.filter(e => e.id !== id);
    saveData();
    renderEntries();
    renderCalendar();
}

// Edit an existing entry
function editEntry(type, id, newTitle, newDate) {
    const list = type === 'assignment' ? data.assignments : data.appointments;
    const entry = list.find(e => e.id === id);
    if (entry) {
        entry.title = newTitle;
        entry.date = newDate;
        const calEntry = data.calendarEvents.find(e => e.id === id);
        if (calEntry) {
            calEntry.title = newTitle;
            calEntry.date = newDate;
        }
        saveData();
        renderEntries();
        renderCalendar();
    }
}

// ======================
// RENDERING FUNCTIONS
// ======================

// Render all entries in the UI
function renderEntries() {
    const assignmentsList = document.getElementById('assignments-list');
    const appointmentsList = document.getElementById('appointments-list');
    if (!assignmentsList || !appointmentsList) return;

    assignmentsList.innerHTML = '';
    appointmentsList.innerHTML = '';

    let assignmentCompleted = 0;
    let assignmentPending = 0;
    let appointmentCompleted = 0;
    let appointmentPending = 0;

    // Create a single entry item
    function createEntryItem(item, type) {
        const li = document.createElement('li');
        li.style.opacity = '0';
        li.style.transform = 'translateY(-10px)';
        li.style.transition = 'opacity 0.3s, transform 0.3s';
        
        setTimeout(() => {
            li.style.opacity = '1';
            li.style.transform = 'translateY(0)';
        }, 10);

        // Mark overdue items
        const today = new Date().toISOString().split('T')[0];
        if (!item.completed && item.date < today) {
            li.classList.add('overdue');
        }

        // Entry HTML structure
        li.innerHTML = `
            <input type="checkbox" class="entry-checkbox" ${item.completed ? 'checked' : ''}>
            <span class="entry-title">${item.title} – ${item.date}</span>
            <span class="edit-btn" title="Bearbeiten">✏️</span>
            <span class="delete-btn" title="Löschen">🗑️</span>
        `;

        // Event listeners
        li.querySelector('.entry-checkbox').addEventListener('change', () => {
            toggleCompletion(type, item.id);
        });

        li.querySelector('.edit-btn').addEventListener('click', () => {
            const newTitle = prompt('Titel bearbeiten:', item.title);
            const newDate = prompt('Datum bearbeiten (YYYY-MM-DD):', item.date);
            if (newTitle && newDate) {
                editEntry(type, item.id, newTitle.trim(), newDate.trim());
            }
        });

        li.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Eintrag wirklich löschen?')) {
                li.style.opacity = '0';
                li.style.transform = 'translateX(100%)';
                li.style.transition = 'opacity 0.3s, transform 0.3s';
                setTimeout(() => {
                    deleteEntry(type, item.id);
                }, 300);
            }
        });

        return li;
    }

    // Render assignments
    data.assignments.forEach(item => {
        assignmentsList.appendChild(createEntryItem(item, 'assignment'));
        item.completed ? assignmentCompleted++ : assignmentPending++;
    });

    // Render appointments
    data.appointments.forEach(item => {
        appointmentsList.appendChild(createEntryItem(item, 'appointment'));
        item.completed ? appointmentCompleted++ : appointmentPending++;
    });

    // Update counters
    document.querySelector('#assigments-todo .completed-counter').textContent = assignmentCompleted;
    document.querySelector('#assigments-todo .uncompleted-counter').textContent = assignmentPending;
    document.querySelector('#appointment-todos .completed-counter').textContent = appointmentCompleted;
    document.querySelector('#appointment-todos .uncompleted-counter').textContent = appointmentPending;
}

// ======================
// CALENDAR FUNCTIONS
// ======================

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Render the calendar
function renderCalendar() {
    const daysContainer = document.getElementById('days');
    const monthYear = document.getElementById('month-year');
    if (!daysContainer || !monthYear) return;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    monthYear.textContent = `${new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(firstDay)} ${currentYear}`;
    daysContainer.innerHTML = '';

    // Empty days at start of month
    for (let i = 0; i < startDay; i++) {
        daysContainer.innerHTML += '<div class="empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.innerHTML = `<span>${day}</span>`;

        // Highlight today
        if (day === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear()) {
            dayElement.classList.add('today');
        }

        // Add events to calendar day
        const events = data.calendarEvents.filter(ev => ev.date === dateStr);
        events.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'event';
            if (!ev.completed && ev.date < new Date().toISOString().split('T')[0]) {
                evDiv.classList.add('overdue');
            }
            evDiv.textContent = ev.title;
            dayElement.appendChild(evDiv);
        });

        daysContainer.appendChild(dayElement);
    }
}

// ======================
// EVENT HANDLERS
// ======================

// Setup calendar navigation
function setupCalendarNavigation() {
    document.getElementById('prev')?.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('next')?.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

// Setup form handlers
function setupFormHandlers() {
    document.getElementById('assignment-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('assignment-title').value;
        const date = document.getElementById('assignment-date').value;
        if (title && date) {
            addEntry('assignment', title, date);
            e.target.reset();
        }
    });

    document.getElementById('appointment-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('appointment-title').value;
        const date = document.getElementById('appointment-date').value;
        if (title && date) {
            addEntry('appointment', title, date);
            e.target.reset();
        }
    });
}

// ======================
// INITIALIZATION
// ======================

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderEntries();
    renderCalendar();
    setupFormHandlers();
    setupCalendarNavigation();

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('nav');
    navToggle?.addEventListener('click', () => {
        navMenu?.classList.toggle('show');
    });
});