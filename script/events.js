// 🔁 Datenstruktur
const data = {
    assignments: [],
    exams: [],
    calendarEvents: []
};

function loadData() {
    const stored = localStorage.getItem('buddooData');
    if (stored) {
        const parsed = JSON.parse(stored);
        data.assignments = parsed.assignments || [];
        data.exams = parsed.exams || [];
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
    if (type === 'exam') data.exams.push(entry);

    data.calendarEvents.push(entry);
    saveData();
    renderEntries();
    renderCalendar();
}

function toggleCompletion(type, id) {
    const list = type === 'assignment' ? data.assignments : data.exams;
    const entry = list.find(e => e.id === id);
    if (entry) {
        entry.completed = !entry.completed;
        saveData();
        renderEntries();
    }
}

function deleteEntry(type, id) {
    data.assignments = data.assignments.filter(e => !(type === 'assignment' && e.id === id));
    data.exams = data.exams.filter(e => !(type === 'exam' && e.id === id));
    data.calendarEvents = data.calendarEvents.filter(e => e.id !== id);
    saveData();
    renderEntries();
    renderCalendar();
}

function editEntry(type, id, newTitle, newDate) {
    const list = type === 'assignment' ? data.assignments : data.exams;
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
    const examsList = document.getElementById('exams-list');
    if (!assignmentsList || !examsList) return;

    assignmentsList.innerHTML = '';
    examsList.innerHTML = '';

    function createEntryItem(item, type) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="entry-title">${item.title} – ${item.date}</span>
            <span class="edit-btn" title="Bearbeiten">✏️</span>
            <span class="delete-btn" title="Löschen">🗑️</span>
        `;

        // ✏️ Bearbeiten
        li.querySelector('.edit-btn').addEventListener('click', () => {
            const newTitle = prompt('Titel bearbeiten:', item.title);
            const newDate = prompt('Datum bearbeiten (YYYY-MM-DD):', item.date);
            if (newTitle && newDate) {
                item.title = newTitle.trim();
                item.date = newDate.trim();
                saveData();
                renderEntries();
                renderCalendar(); // Kalender auch aktualisieren
            }
        });

        // 🗑️ Löschen
        li.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Eintrag wirklich löschen?')) {
                if (type === 'assignment') {
                    data.assignments = data.assignments.filter(e => e.id !== item.id);
                } else if (type === 'exam') {
                    data.exams = data.exams.filter(e => e.id !== item.id);
                }
                data.calendarEvents = data.calendarEvents.filter(e => e.id !== item.id);
                saveData();
                renderEntries();
                renderCalendar();
            }
        });

        return li;
    }

    data.assignments.forEach(item => {
        assignmentsList.appendChild(createEntryItem(item, 'assignment'));
    });

    data.exams.forEach(item => {
        examsList.appendChild(createEntryItem(item, 'exam'));
    });
}


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

        const events = data.calendarEvents.filter(ev => ev.date === dateStr);
        events.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = `event ${ev.type}`;
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
    const examForm = document.getElementById('exam-form');

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

    if (examForm) {
        examForm.addEventListener('submit', e => {
            e.preventDefault();
            const title = document.getElementById('exam-title').value;
            const date = document.getElementById('exam-date').value;
            if (title && date) {
                addEntry('exam', title, date);
                examForm.reset();
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
