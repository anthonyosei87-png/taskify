const API_URL = 'https://taskify-backend-c1nm.onrender.com/api/tasks';

const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const errorTitle = document.getElementById('error-title');
const tasksContainer = document.getElementById('tasks-container');

document.addEventListener('DOMContentLoaded', fetchTasks);

async function fetchTasks() {
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        const tasks = await response.json();
        tasksContainer.innerHTML = ''; // Clear container

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<p class="loading">No tasks found. Add one above!</p>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.is_completed ? 'completed' : ''}`;
            
            taskElement.innerHTML = `
                <div class="task-info">
                    <p class="task-text-title">${task.title}</p>
                    ${task.description ? `<p class="task-text-desc">${task.description}</p>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn-check" onclick="toggleTask(${task.id}, ${task.is_completed})">
                        ${task.is_completed ? '🔄' : '✅'}
                    </button>
                    <button class="btn-delete" onclick="deleteTask(${task.id})">❌</button>
                </div>
            `;
            tasksContainer.appendChild(taskElement);
        });
    } catch (error) {
        console.error("Fetch tasks failed:", error);
        tasksContainer.innerHTML = `<p class="error-msg">Error loading tasks. Is backend running?</p>`;
    }
}

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();

    if (!title) {
        errorTitle.textContent = "Please enter a task title.";
        taskTitleInput.style.borderColor = "var(--danger)";
        return;
    } else {
        errorTitle.textContent = "";
        taskTitleInput.style.borderColor = "#d1d5db";
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            taskTitleInput.value = '';
            taskDescInput.value = '';
            fetchTasks(); // Refresh list
        } else {
            const data = await response.json();
            errorTitle.textContent = data.error || "Failed to add task";
        }
    } catch (error) {
        console.error("Error creating task:", error);
        errorTitle.textContent = "Cannot connect to server API backend.";
    }
});

async function toggleTask(id, currentStatus) {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ is_completed: newStatus })
        });
        fetchTasks();
    } catch (error) {
        console.error("Error updating task:", error);
    }
}

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
        await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        fetchTasks();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}
