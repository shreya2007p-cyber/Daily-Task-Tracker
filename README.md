# Daily Task Tracker

A simple desktop task management application built with Electron, HTML, CSS, and JavaScript.

## Features

- Add new tasks
- Mark tasks as completed or incomplete
- Delete tasks
- Track completion progress
- Save tasks locally in JSON format
- Restore saved tasks when reopening the app

## Technologies Used

- Electron.js
- HTML5
- CSS3
- JavaScript
- Node.js
- JSON file storage

## Installation

Make sure Node.js and npm are installed.

```bash
git clone https://github.com/YOUR_USERNAME/Daily-Task-Tracker.git
cd Daily-Task-Tracker
npm install
npm start
```

Replace `YOUR_USERNAME` with your GitHub username.

## How to Use

1. Launch the application.
2. Enter a task and click Add Task.
3. Use the checkbox to mark a task complete or incomplete.
4. Click Delete to remove a task.
5. Close and reopen the app to verify saved tasks are restored.

## Project Structure

- `main.js` — Electron main process and JSON storage
- `preload.js` — Secure bridge between Electron and the interface
- `index.html` — Application interface and styling
- `renderer.js` — Task management and progress logic
- `package.json` — Project configuration

## License

MIT