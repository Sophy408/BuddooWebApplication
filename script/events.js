// 🔁 Datenstruktur
const data = {
    assignments: [],
    appointments: [],
    calendarEvents: []
};

function loadData() {
    const stored = localStorage.getItem('buddooData');
    if (stored) {
        const parsed = JSON.parse(stored);
        data.assignments = parsed.assignments || [];
        data.appointments = parsed.appointments || [];
        data.calendarEvents = parsed.calendarEvents || [];
    }
}

function saveData() {
    localStorage.setItem('buddooData', JSON.stringify(data));
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
            item.completed = !item.completed;
            saveData();
            renderEntries();
            renderCalendar();
        });

        li.querySelector('.edit-btn').addEventListener('click', () => {
            const newTitle = prompt('Titel bearbeiten:', item.title);
            const newDate = prompt('Datum bearbeiten (YYYY-MM-DD):', item.date);
            if (newTitle && newDate) {
                item.title = newTitle.trim();
                item.date = newDate.trim();
                saveData();
                renderEntries();
                renderCalendar();
            }
        });

        li.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Eintrag wirklich löschen?')) {
                li.style.opacity = '0';
                li.style.transform = 'translateX(100%)';
                li.style.transition = 'opacity 0.3s, transform 0.3s';
                setTimeout(() => {
                    if (type === 'assignment') {
                        data.assignments = data.assignments.filter(e => e.id !== item.id);
                    } else if (type === 'appointment') {
                        data.appointments = data.appointments.filter(e => e.id !== item.id);
                    }
                    data.calendarEvents = data.calendarEvents.filter(e => e.id !== item.id);
                    saveData();
                    renderEntries();
                    renderCalendar();
                }, 300);
            }
        });

        return li;
    }

    data.assignments.forEach(item => {
        const li = createEntryItem(item, 'assignment');
        assignmentsList.appendChild(li);
        item.completed ? assignmentCompleted++ : assignmentPending++;
    });

    data.appointments.forEach(item => {
        const li = createEntryItem(item, 'appointment');
        appointmentsList.appendChild(li);
        item.completed ? appointmentCompleted++ : appointmentPending++;
    });

    document.querySelector('#assigments-todo .completed-counter').textContent = assignmentCompleted;
    document.querySelector('#assigments-todo .uncompleted-counter').textContent = assignmentPending;
    document.querySelector('#appointment-todos .completed-counter').textContent = appointmentCompleted;
    document.querySelector('#appointment-todos .uncompleted-counter').textContent = appointmentPending;
}

// 📅 Kalender
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

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

    for (let i = 0; i < startDay; i++) {
        daysContainer.innerHTML += '<div class="empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.innerHTML = `<span>${day}</span>`;

        if (
            day === currentDate.getDate() &&
            currentMonth === currentDate.getMonth() &&
            currentYear === currentDate.getFullYear()
        ) {
            dayElement.classList.add('today');
        }

        const today = new Date().toISOString().split('T')[0];
        const events = data.calendarEvents.filter(ev => ev.date === dateStr);
        events.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'event';
            if (!ev.completed && ev.date < today) {
                evDiv.classList.add('overdue');
            }
            evDiv.textContent = ev.title;
            dayElement.appendChild(evDiv);
        });

        daysContainer.appendChild(dayElement);
    }
}

function setupCalendarNavigation() {
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }
}

function setupFormHandlers() {
    const assignmentForm = document.getElementById('assignment-form');
    const appointmentForm = document.getElementById('appointment-form');

    if (assignmentForm) {
        assignmentForm.addEventListener('submit', e => {
            e.preventDefault();
            const title = document.getElementById('assignment-title').value;
            const date = document.getElementById('assignment-date').value;
            if (title && date) {
                addEntry('assignment', title, date);
                assignmentForm.reset();
            }
        });
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', e => {
            e.preventDefault();
            const title = document.getElementById('appointment-title').value;
            const date = document.getElementById('appointment-date').value;
            if (title && date) {
                addEntry('appointment', title, date);
                appointmentForm.reset();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderEntries();
    renderCalendar();
    setupFormHandlers();
    setupCalendarNavigation();
});
