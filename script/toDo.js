document.addEventListener('DOMContentLoaded', function() {
    // Initialize all todo sections
    const sections = ['morning', 'afternoon', 'evening'];
    
    sections.forEach(section => {
        const container = document.getElementById(`${section}-todos`);
        
        // Get elements
        const input = container.querySelector('.input-item');
        const addButton = container.querySelector('.input-button');
        const listContainer = container.querySelector('.list-container');
        const completedCounter = container.querySelector('.completed-counter');
        const uncompletedCounter = container.querySelector('.uncompleted-counter');
        
        // Load saved tasks
        loadTasks(section, listContainer, completedCounter, uncompletedCounter);
        
        // Add task event
        addButton.addEventListener('click', () => {
            addTask(section, input, listContainer, completedCounter, uncompletedCounter);
        });
        
        // Enter key event
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask(section, input, listContainer, completedCounter, uncompletedCounter);
            }
        }); 
        
        // List container events
        listContainer.addEventListener('click', (e) => {
            const target = e.target;
            const listItem = target.closest('li');
            
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
        });
    });
    
    // Animation for removing items
    function animateRemove(element, callback) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        setTimeout(callback, 300);
    }
    
    // Add new task
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
        
        // Add animation
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
    
    // Edit task
    function editTask(listItem, section, listContainer, completedCounter, uncompletedCounter) {
        const textSpan = listItem.querySelector('.task-text');
        const newText = prompt('Edit your task:', textSpan.textContent);
        
        if (newText !== null && newText.trim() !== '') {
            textSpan.textContent = newText.trim();
            saveTasks(section, listContainer);
            updateCounters(listContainer, completedCounter, uncompletedCounter);
        }
    }
    
    // Update counters
    function updateCounters(listContainer, completedCounter, uncompletedCounter) {
        const checkboxes = listContainer.querySelectorAll('.task-checkbox');
        let completed = 0;
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) completed++;
        });
        
        completedCounter.textContent = completed;
        uncompletedCounter.textContent = checkboxes.length - completed;
    }
    
    // Save tasks to localStorage
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
    
    // Load tasks from localStorage
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
});