/**
 * TO-DO LIST MANAGER
 * Handles morning/afternoon/evening tasks with server-based persistence
 */

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const res = await fetch('/api/me', {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) throw new Error();
        const user = await res.json();
        console.log("👤 Eingeloggt als:", user.username);
    }
    catch (err) {
    console.warn("⚠️ Fehler beim Laden des Benutzers:", err);
    window.location.href = "/html/index.html";
    return;
}


    const SECTIONS = ['morning', 'afternoon', 'evening'];
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('nav ul');
    const data = { 
    todos: { morning: [], afternoon: [], evening: [] },
    notes: ""  
};

    async function loadData() {
    try {
        const res = await fetch('/api/data', { credentials: 'include' });
        if (!res.ok) throw new Error('Nicht eingeloggt');
        const json = await res.json();
        data.todos = json.todos || { morning: [], afternoon: [], evening: [] };
        data.notes = json.notes || "";
        document.getElementById("note-area").value = data.notes;
    } catch (err) {
        console.error('Fehler beim Laden:', err);
        window.location.href = '/html/index.html';
    }
}

    async function saveData() {
    data.notes = document.getElementById("note-area").value;
    try {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ 
                todos: data.todos,
                notes: data.notes
            })
        });
        if (!res.ok) throw new Error('Speichern fehlgeschlagen');
    } catch (err) {
        console.error('Fehler beim Speichern:', err);
    }
}

    function initializeSections() {
        SECTIONS.forEach(section => {
            const container = document.getElementById(`${section}-todos`);
            if (!container) return;

            const elements = {
                input: container.querySelector('.input-item'),
                addButton: container.querySelector('.input-button'),
                listContainer: container.querySelector('.list-container'),
                completedCounter: container.querySelector('.completed-counter'),
                uncompletedCounter: container.querySelector('.uncompleted-counter')
            };

            renderTasks(section, elements.listContainer, elements.completedCounter, elements.uncompletedCounter);
            setupSectionEventListeners(section, elements);
        });
    }

    function setupSectionEventListeners(section, {input, addButton, listContainer, completedCounter, uncompletedCounter}) {
        addButton.addEventListener('click', () => {
            addTask(section, input, listContainer, completedCounter, uncompletedCounter);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask(section, input, listContainer, completedCounter, uncompletedCounter);
            }
        });

        listContainer.addEventListener('click', handleListItemClick.bind(null, section, listContainer, completedCounter, uncompletedCounter));
    }

    function handleListItemClick(section, listContainer, completedCounter, uncompletedCounter, e) {
        const target = e.target;
        const listItem = target.closest('li');
        if (!listItem) return;

        if (target.classList.contains('delete-btn')) {
            animateRemove(listItem, () => {
                listItem.remove();
                saveTasksFromDOM(section, listContainer);
                updateCounters(listContainer, completedCounter, uncompletedCounter);
            });
        } else if (target.classList.contains('edit-btn')) {
            editTask(listItem, section, listContainer, completedCounter, uncompletedCounter);
        } else if (target.classList.contains('task-checkbox')) {
            saveTasksFromDOM(section, listContainer);
            updateCounters(listContainer, completedCounter, uncompletedCounter);
        }
    }

    function addTask(section, input, listContainer, completedCounter, uncompletedCounter) {
        const taskText = input.value.trim();
        if (!taskText) {
            alert('Don`t fool around, enter a task!');
            return;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <label>
                <input type="checkbox" class="task-checkbox">
                <span class="task-text">${taskText}</span>
            </label>
            <span class="edit-btn">✏️</span>
            <span class="delete-btn">🗑️</span>
        `;

        li.style.opacity = '0';
        listContainer.appendChild(li);
        setTimeout(() => {
            li.style.transition = 'opacity 0.3s, transform 0.3s';
            li.style.opacity = '1';
        }, 10);

        input.value = '';
        saveTasksFromDOM(section, listContainer);
        updateCounters(listContainer, completedCounter, uncompletedCounter);
    }

    function animateRemove(element, callback) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        setTimeout(callback, 300);
    }

    function editTask(listItem, section, listContainer, completedCounter, uncompletedCounter) {
        const textSpan = listItem.querySelector('.task-text');
        const newText = prompt('Edit your task:', textSpan.textContent);
        if (newText !== null && newText.trim() !== '') {
            textSpan.textContent = newText.trim();
            saveTasksFromDOM(section, listContainer);
            updateCounters(listContainer, completedCounter, uncompletedCounter);
        }
    }

    function updateCounters(listContainer, completedCounter, uncompletedCounter) {
        const checkboxes = listContainer.querySelectorAll('.task-checkbox');
        let completed = 0;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) completed++;
        });
        completedCounter.textContent = completed;
        uncompletedCounter.textContent = checkboxes.length - completed;
    }

    function saveTasksFromDOM(section, listContainer) {
        const tasks = [];
        listContainer.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.querySelector('.task-text').textContent,
                completed: li.querySelector('.task-checkbox').checked
            });
        });
        data.todos[section] = tasks;
        saveData();
    }

    function renderTasks(section, listContainer, completedCounter, uncompletedCounter) {
        listContainer.innerHTML = '';
        const tasks = data.todos[section] || [];
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label>
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </label>
                <span class="edit-btn">✏️</span>
                <span class="delete-btn">🗑️</span>
            `;
            listContainer.appendChild(li);
        });
        updateCounters(listContainer, completedCounter, uncompletedCounter);
    }

    function setupMobileNavigation() {
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('show');
            });
        }
    }


    await loadData();
    initializeSections();
    setupMobileNavigation();
});
