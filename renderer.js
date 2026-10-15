
const form = document.getElementById('taskForm');
const input = document.getElementById('taskInput');
const list = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const taskCount = document.getElementById('taskCount');
const progress = document.getElementById('progress');
const progressText = document.getElementById('progressText');
const status = document.getElementById('status');
const clearButton = document.getElementById('clearCompleted');

let tasks = [];
let busy = false;
let currentFilter = 'all';

function showStatus(message) {
  status.textContent = message;
}

function renderTasks() {
  list.replaceChildren();

  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = tasks.length
    ? Math.round(completedCount / tasks.length * 100)
    : 0;

  taskCount.textContent =
    `${tasks.length} tasks · ${completedCount} done`;
  progressText.textContent = `${percentage}% complete`;
  progress.style.width = `${percentage}%`;

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length === 0
    ? 'No tasks yet. Add your first task!'
    : 'No tasks in this filter.';

  for (const task of visibleTasks) {
    const item = document.createElement('li');
    item.className = 'task';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Complete ${task.text}`);

    checkbox.addEventListener('change', () => {
      changeTask(task.id, current => {
        current.completed = checkbox.checked;
      });
    });

    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = task.text;
    if (task.completed) label.classList.add('completed');

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', () => {
      changeTask(task.id, (_current, all) => {
        const index = all.findIndex(t => t.id === task.id);
        if (index !== -1) all.splice(index, 1);
      });
    });

    item.append(checkbox, label, deleteButton);
    list.append(item);
  }

  document.querySelectorAll('.filters .filter-btn').forEach(button => {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  clearButton.disabled = completedCount === 0 || busy;
}

async function saveTasks() {
  await window.taskStorage.save(tasks);
}

async function changeTask(id, update) {
  if (busy) return;
  busy = true;
  renderTasks();

  const previous = tasks.map(task => ({ ...task }));

  try {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) update(tasks[index], tasks);

    await saveTasks();
    showStatus('');
  } catch (error) {
    tasks = previous;
    showStatus(`Could not save changes: ${error.message}`);
  } finally {
    busy = false;
    renderTasks();
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;

  const text = input.value.trim();
  if (!text) {
    showStatus('Please enter a task.');
    return;
  }

  busy = true;
  renderTasks();

  const previous = tasks.map(task => ({ ...task }));

  tasks.push({
    id: crypto.randomUUID(),
    text,
    completed: false
  });

  try {
    await saveTasks();
    input.value = '';
    currentFilter = 'all';
    showStatus('');
    input.focus();
  } catch (error) {
    tasks = previous;
    showStatus(`Could not save task: ${error.message}`);
  } finally {
    busy = false;
    renderTasks();
  }
});

document.querySelectorAll('.filters .filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearButton.addEventListener('click', async () => {
  if (busy) return;

  const previous = tasks.map(task => ({ ...task }));
  const remaining = tasks.filter(task => !task.completed);

  if (remaining.length === tasks.length) return;

  busy = true;
  renderTasks();

  try {
    tasks = remaining;
    await saveTasks();
    showStatus('Completed tasks cleared.');
  } catch (error) {
    tasks = previous;
    showStatus(`Could not clear tasks: ${error.message}`);
  } finally {
    busy = false;
    renderTasks();
  }
});

// Theme setup and persistence
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById('themeToggle').textContent =
    theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode';
}

const savedTheme = localStorage.getItem('taskTheme') || 'light';
applyTheme(savedTheme);

document.getElementById('themeToggle').addEventListener('click', () => {
  const nextTheme =
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

  applyTheme(nextTheme);
  localStorage.setItem('taskTheme', nextTheme);
});

async function initialize() {
  try {
    tasks = await window.taskStorage.load();
    renderTasks();
  } catch (error) {
    showStatus(`Could not load saved tasks: ${error.message}`);
  }
}

initialize();
