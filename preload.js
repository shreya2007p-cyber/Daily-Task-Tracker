
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('taskStorage', {
  load: () => ipcRenderer.invoke('tasks:load'),
  save: (tasks) => ipcRenderer.invoke('tasks:save', tasks)
});
