# Task Runner

A flexible and modular task scheduling utility that supports multiple storage methods, including Chrome storage, localStorage, file-based storage (Node.js), and custom storage handlers.

🚀 Features

- ✅ Register and execute scheduled tasks (one-time or recurring).
- ✅ Multiple storage options: Chrome storage, localStorage, file system, or custom.
- ✅ Modular storage system – easily switch or add new storage handlers.
- ✅ Task persistence – tasks are saved and loaded automatically.
- ✅ Prevent duplicate tasks from being reloaded.
- ✅ Error handling to avoid crashes in recurring tasks.
- ✅ Easily clear all tasks with clearAllTasks().

📦 Installation

## Clone the repository
```bash
git clone https://github.com/your-username/task-runner.git
cd task-runner
```

## Install dependencies (if any)
```bash
npm install
```

## 📖 Usage

### 1️⃣ Import & Create an Instance
```js
const TaskRunner = require("./taskRunner");

// Create an instance using localStorage (for browser-based apps)
const taskRunner = new TaskRunner("localStorage");
```

### 2️⃣ Register Task Handlers

Before adding tasks, you must register functions to be executed.
```js
taskRunner.registerTaskHandler("fetchData", () => console.log("Fetching API data..."));
taskRunner.registerTaskHandler("heartbeat", () => console.log("Heartbeat ping..."));
```

### 3️⃣ Add Tasks

🔹 Add a one-time task
```js
taskRunner.addTask("fetchDataTask", "fetchData", null);
```

🔹 Add a recurring task (every 10 seconds)
```js
taskRunner.addTask("heartbeatTask", "heartbeat", 10000);
```

### 4️⃣ List Tasks
```js
console.log(taskRunner.listTasks());
```

Output:
```js
[
    { taskId: "fetchDataTask", functionName: "fetchData", interval: "one-time", type: "one-time" },
    { taskId: "heartbeatTask", functionName: "heartbeat", interval: "10 seconds", type: "recurring" }
]
```

### 5️⃣ Remove a Task
```js
taskRunner.removeTask("heartbeatTask");
```

### 6️⃣ Clear All Tasks
```js
taskRunner.clearAllTasks();
```

### 7️⃣ Persistent Task Storage

Tasks are automatically saved and reloaded when using Chrome storage, localStorage, or file-based storage.

To manually save tasks, use:
```js
taskRunner.saveTasks();
```

To manually load saved tasks, use:
```js
taskRunner.loadTasks();
```

### 🛠 Custom Storage Handlers

You can add your own storage backend (e.g., Database, IndexedDB, Redis).

Example: Custom storage using console logs (for debugging).
```js
const customStorageHandler = {
    save: (tasks) => console.log("Saving tasks:", tasks),
    load: (callback) => {
        console.log("Loading tasks...");
        callback({ savedTasks: {} });
    },
};

// Use the custom storage handler
const taskRunner = new TaskRunner("custom", customStorageHandler);
```

### 📂 File Storage (Node.js)

To save tasks to a file (tasks.json), you can define a file-based storage handler.
```js
const fs = require("fs");

taskRunner.addStorageHandler("fileStorage", {
    save: (tasks) => fs.writeFileSync("tasks.json", JSON.stringify(tasks)),
    load: (callback) => {
        if (fs.existsSync("tasks.json")) {
            callback({ savedTasks: JSON.parse(fs.readFileSync("tasks.json", "utf-8")) });
        } else {
            callback({ savedTasks: {} });
        }
    }
});

// Switch to file storage
taskRunner.setStorageMethod("fileStorage");

// Load tasks from the file
taskRunner.loadTasks();
```

### 🔄 Auto-Reloading Tasks

If you’re using Chrome Extensions, you can load tasks automatically on startup:
```js
chrome.runtime.onStartup.addListener(() => {
    taskRunner.loadTasks();
});
```

### 🚨 Error Handling

All scheduled tasks run inside a try...catch block, preventing failures from crashing the whole scheduler:
```js
const runTask = () => {
    try {
        this.taskHandlers[functionName]();
    } catch (error) {
        console.error(`Error executing task '${taskId}':`, error);
    }
};
```

## ⚡ Performance Considerations
- Avoid too many recurring tasks (e.g., running 100+ tasks every second can be inefficient).
- For Node.js, consider using a job queue for long-running tasks.
- Use file-based or database storage for larger-scale apps instead of localStorage.

## ✅ Future Enhancements
- ✅ Promise-based task execution (for async tasks).
- ✅ Task priority management (run certain tasks before others).
- ✅ Event-based task triggers (e.g., execute a task when a condition is met).

## 💡 Contributing

Feel free to submit issues or pull requests. Contributions are welcome! 🎉

## 📄 License

This project is licensed under the MIT License.
