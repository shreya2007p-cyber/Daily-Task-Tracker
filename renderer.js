
const form = document.getElementById('taskForm');
const input = document.getElementById('taskInput');
const list = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const taskCount = document.getElementById('taskCount');
const progress = document.getElementById('progress');
const progressText = document.getElementById('progressText');
const status = document.getElementById('status');

let tasks = [];
let busy = false;

function showStatus(message) {
  status.textContent = message;
}

function renderTasks() {
  list.replaceChildren();

  const completedCount = tasks.filter(task => task.completed).length;
  const percentage = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  taskCount.textContent =
    `${tasks.length} task${tasks.length === 1 ? '' : 's'} · ${completedCount} done`;

  progressText.textContent = `${percentage}% complete`;
  progress.style.width = `${percentage}%`;
  emptyMessage.hidden = tasks.length > 0;

  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = 'task';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      'aria-label',
      `Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`
    );

    checkbox.addEventListener('change', async () => {
      await changeTask(task.id, current => {
        current.completed = checkbox.checked;
      });
    });

    const label = document.createElement('span');
    label.className = 'task-text';
    if (task.completed) label.classList.add('completed');
    label.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${task.text}`);

    deleteButton.addEventListener('click', async () => {
      await changeTask(task.id, (_current, allTasks) => {
        allTasks.splice(
          allTasks.findIndex(t => t.id === task.id),
          1
        );
      });
    });

    item.append(checkbox, label, deleteButton);
    list.append(item);
  }
}

async function saveTasks() {
  await window.taskStorage.save(tasks);
}

async function changeTask(id, update) {
  if (busy) return;
  busy = true;

  const previous = tasks.map(task => ({ ...task }));

  try {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) update(tasks[index], tasks);

    await saveTasks();
    renderTasks();
    showStatus('');
 }  catch (error) {
  console.error('Task save failed:', error);

  tasks = previous;
  renderTasks();

  showStatus(`Could not save task: ${error.message}`);
}finally {
    busy = false;
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
  const previous = tasks.map(task => ({ ...task }));

  tasks.push({
    id: crypto.randomUUID(),
    text,
    completed: false
  });

  try {
    await saveTasks();
    input.value = '';
    renderTasks();
    showStatus('');
    input.focus();
  } catch (error) {
    tasks = previous;
    renderTasks();
    showStatus(`Could not save task: ${error.message}`);
  } finally {
    busy = false;
  }
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
