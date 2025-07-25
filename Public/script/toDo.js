"use strict";

/**
 * TO-DO LIST MANAGER
 * Handles morning/afternoon/evening tasks with localStorage persistence
 */
document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // CONSTANTS AND ELEMENTS
    // ======================
    const SECTIONS = ['morning', 'afternoon', 'evening'];
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('nav ul');

    // ======================
    // CORE FUNCTIONALITY
    // ======================

    /**
     * Initializes all to-do sections
     */
    function initializeSections() {
        SECTIONS.forEach(section => {
            const container = document.getElementById(`${section}-todos`);
            if (!container) return;

            // Get section elements
            const elements = {
                input: container.querySelector('.input-item'),
                addButton: container.querySelector('.input-button'),
                listContainer: container.querySelector('.list-container'),
                completedCounter: container.querySelector('.completed-counter'),
                uncompletedCounter: container.querySelector('.uncompleted-counter')
            };

            // Load saved tasks
            loadTasks(section, elements.listContainer, elements.completedCounter, elements.uncompletedCounter);

            // Set up event listeners
            setupSectionEventListeners(section, elements);
        });
    }

    /**
     * Sets up event listeners for a to-do section
     */
    function setupSectionEventListeners(section, {input, addButton, listContainer, completedCounter, uncompletedCounter}) {
        // Add task button click
        addButton.addEventListener('click', () => {
            addTask(section, input, listContainer, completedCounter, uncompletedCounter);
        });

        // Enter key in input
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask(section, input, listContainer, completedCounter, uncompletedCounter);
            }
        });

        // List item interactions (delegated)
        listContainer.addEventListener('click', handleListItemClick.bind(null, section, listContainer, completedCounter, uncompletedCounter));
    }

    // ======================
    // TASK MANAGEMENT
    // ======================

    /**
     * Handles all list item interactions (delete, edit, checkbox)
     */
    function handleListItemClick(section, listContainer, completedCounter, uncompletedCounter, e) {
        const target = e.target;
        const listItem = target.closest('li');
        if (!listItem) return;

        if (target.classList.contains('delete-btn')) {
            animateRemove(listItem, () => {
                listItem.remove();
                saveTasks(section, listContainer);
                updateCounters(listContainer, completedCounter, uncompletedCounter);
            });
        } 
        else if (target.classList.contains('edit-btn')) {
            editTask(listItem, section, listContainer, completedCounter, uncompletedCounter);
        }
        else if (target.classList.contains('task-checkbox')) {
            saveTasks(section, listContainer);
            updateCounters(listContainer, completedCounter, uncompletedCounter);
        }
    }

    /**
     * Adds a new task to the list
     */
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
        
        // Fade-in animation
        li.style.opacity = '0';
        listContainer.appendChild(li);
        
        setTimeout(() => {
            li.style.transition = 'opacity 0.3s, transform 0.3s';
            li.style.opacity = '1';
        }, 10);
        
        input.value = '';
        saveTasks(section, listContainer);
        updateCounters(listContainer, completedCounter, uncompletedCounter);
    }

    // ======================
    // HELPER FUNCTIONS
    // ======================

    /**
     * Animates task removal
     */
    function animateRemove(element, callback) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        setTimeout(callback, 300);
    }

    /**
     * Handles task editing
     */
    function editTask(listItem, section, listContainer, completedCounter, uncompletedCounter) {
        const textSpan = listItem.querySelector('.task-text');
        const newText = prompt('Edit your task:', textSpan.textContent);
        
        if (newText !== null && newText.trim() !== '') {
            textSpan.textContent = newText.trim();
            saveTasks(section, listContainer);
            updateCounters(listContainer, completedCounter, uncompletedCounter);
        }
    }

    /**
     * Updates completed/uncompleted counters
     */
    function updateCounters(listContainer, completedCounter, uncompletedCounter) {
        const checkboxes = listContainer.querySelectorAll('.task-checkbox');
        let completed = 0;
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) completed++;
        });
        
        completedCounter.textContent = completed;
        uncompletedCounter.textContent = checkboxes.length - completed;
    }

    // ======================
    // STORAGE FUNCTIONS
    // ======================

    function saveTasks(section, listContainer) {
        const tasks = [];
        listContainer.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.querySelector('.task-text').textContent,
                completed: li.querySelector('.task-checkbox').checked
            });
        });
        localStorage.setItem(`tasks-${section}`, JSON.stringify(tasks));
    }

    function loadTasks(section, listContainer, completedCounter, uncompletedCounter) {
        const savedTasks = localStorage.getItem(`tasks-${section}`);
        if (savedTasks) {
            JSON.parse(savedTasks).forEach(task => {
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
    }

    // ======================
    // NAVIGATION
    // ======================

    function setupMobileNavigation() {
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('show');
            });
        }
    }

    // ======================
    // INITIALIZATION
    // ======================

    initializeSections();
    setupMobileNavigation();
});