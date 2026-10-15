
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const dataFile = () => path.join(app.getPath('userData'), 'tasks.json');

async function readTasks() {
  try {
    const data = await fs.readFile(dataFile(), 'utf8');
    const tasks = JSON.parse(data);

    if (!Array.isArray(tasks)) {
      throw new Error('Invalid tasks file format');
    }

    return tasks;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

ipcMain.handle('tasks:load', async () => {
  return readTasks();
});

ipcMain.handle('tasks:save', async (_event, tasks) => {
  if (!Array.isArray(tasks) || tasks.length > 10000) {
    throw new Error('Invalid task list');
  }

  for (const task of tasks) {
    if (
      !task ||
      typeof task.id !== 'string' ||
      typeof task.text !== 'string' ||
      task.text.trim().length === 0 ||
      task.text.length > 500 ||
      typeof task.completed !== 'boolean'
    ) {
      throw new Error('Invalid task data');
    }
  }

  await fs.mkdir(app.getPath('userData'), { recursive: true });

  await fs.writeFile(
    dataFile(),
    JSON.stringify(tasks, null, 2),
    'utf8'
  );

  return true;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 600,
    minHeight: 450,
    title: 'Daily Task Tracker',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
