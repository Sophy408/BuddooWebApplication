"use strict";

/**
 * BUDDOO EVENTS MODULE
 * Handles assignments, appointments, and calendar functionality
 */

fetch('/api/me', {
  method: 'GET',
  credentials: 'include'
})
.then(res => {
  if (!res.ok) throw new Error();
  return res.json();
})
.then(user => {
  console.log("👤 Logged in as:", user.username);
})
.catch(() => {
  window.location.href = "/html/index.html";
});

const data = {
  assignments: [],
  appointments: [],
  calendarEvents: [],
  todos: {},
  notes: []
};

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

async function loadData() {
  try {
    const res = await fetch('/api/data', { credentials: 'include' });
    if (!res.ok) throw new Error('not logged in');
    const json = await res.json();

    data.assignments = json.events?.assignments || [];
    data.appointments = json.events?.appointments || [];
    data.calendarEvents = json.events?.calendarEvents || [];
    data.todos = json.todos || {};
    data.notes = json.notes || [];

    renderEntries();
    renderCalendar();
  } catch (err) {
    console.error('error while loading:', err);
    window.location.href = '/html/index.html';
  }
}

async function saveData() {
  const payload = {
    events: {
      assignments: data.assignments,
      appointments: data.appointments,
      calendarEvents: data.calendarEvents
    },
    todos: data.todos,
    notes: data.notes
  };

  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('saving failed');
    console.log('✅ Data saved');
  } catch (err) {
    console.error('error while saving:', err);
  }
}

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

function toggleCompletion(type, id) {
  const list = type === 'assignment' ? data.assignments : data.appointments;
  const entry = list.find(e => e.id === id);
  if (entry) {
    entry.completed = !entry.completed;
    saveData();
    renderEntries();
  }
}

function deleteEntry(type, id) {
  data.assignments = data.assignments.filter(e => !(type === 'assignment' && e.id === id));
  data.appointments = data.appointments.filter(e => !(type === 'appointment' && e.id === id));
  data.calendarEvents = data.calendarEvents.filter(e => e.id !== id);
  saveData();
  renderEntries();
  renderCalendar();
}

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

  function createEntryItem(item, type) {
    const li = document.createElement('li');
    li.style.opacity = '0';
    li.style.transform = 'translateY(-10px)';
    li.style.transition = 'opacity 0.3s, transform 0.3s';

    setTimeout(() => {
      li.style.opacity = '1';
      li.style.transform = 'translateY(0)';
    }, 10);

    const today = new Date().toISOString().split('T')[0];
    if (!item.completed && item.date < today) {
      li.classList.add('overdue');
    }

    li.innerHTML = `
      <input type="checkbox" class="entry-checkbox" ${item.completed ? 'checked' : ''}>
      <span class="entry-title">${item.title} – ${item.date}</span>
      <span class="edit-btn" title="Bearbeiten">✏️</span>
      <span class="delete-btn" title="Löschen">🗑️</span>
    `;

    li.querySelector('.entry-checkbox').addEventListener('change', () => {
      toggleCompletion(type, item.id);
    });

    li.querySelector('.edit-btn').addEventListener('click', () => {
      const newTitle = prompt('edit title:', item.title);
      const newDate = prompt('edit date (YYYY-MM-DD):', item.date);
      if (newTitle && newDate) {
        editEntry(type, item.id, newTitle.trim(), newDate.trim());
      }
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('Do you really wanna delete this?')) {
        li.style.opacity = '0';
        li.style.transform = 'translateX(100%)';
        setTimeout(() => deleteEntry(type, item.id), 300);
      }
    });

    return li;
  }

  data.assignments.forEach(item => {
    assignmentsList.appendChild(createEntryItem(item, 'assignment'));
    item.completed ? assignmentCompleted++ : assignmentPending++;
  });

  data.appointments.forEach(item => {
    appointmentsList.appendChild(createEntryItem(item, 'appointment'));
    item.completed ? appointmentCompleted++ : appointmentPending++;
  });

  document.querySelector('#assigments-todo .completed-counter').textContent = assignmentCompleted;
  document.querySelector('#assigments-todo .uncompleted-counter').textContent = assignmentPending;
  document.querySelector('#appointment-todos .completed-counter').textContent = appointmentCompleted;
  document.querySelector('#appointment-todos .uncompleted-counter').textContent = appointmentPending;
}

function renderCalendar() {
  const daysContainer = document.getElementById('days');
  const monthYear = document.getElementById('month-year');
  if (!daysContainer || !monthYear) return;

  const year = currentYear;
  const month = currentMonth;
  const today = new Date();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  monthYear.textContent = `${new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(firstDay)} ${year}`;
  daysContainer.innerHTML = '';

  for (let i = 0; i < startDay; i++) {
    daysContainer.innerHTML += '<div class="empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.innerHTML = `<span>${day}</span>`;

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayElement.classList.add('today');
    }

    const events = data.calendarEvents.filter(ev => ev.date === dateStr);
    events.forEach(ev => {
      const evDiv = document.createElement('div');
      evDiv.className = 'event';
      if (!ev.completed && ev.date < today.toISOString().split('T')[0]) {
        evDiv.classList.add('overdue');
      }
      evDiv.textContent = ev.title;
      dayElement.appendChild(evDiv);
    });

    daysContainer.appendChild(dayElement);
  }
}

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

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/me', {
    method: 'GET',
    credentials: 'include'
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    loadData();
    setupFormHandlers();
    setupCalendarNavigation();
  })
  .catch(() => {
    window.location.href = "/html/index.html";
  });
});
