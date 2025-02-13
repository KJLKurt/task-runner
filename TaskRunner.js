
/**
 * TaskRunner - A flexible task scheduling utility with configurable storage.
 * Supports Chrome storage, localStorage, file-based storage, or custom storage methods.
 */

export class TaskRunner {
    constructor(storageMethod = "chrome", customStorageHandler = null) {
        this.tasks = {}; // { taskId: { timeoutId, functionName, interval, type } }
        this.taskHandlers = {}; // { functionName: functionReference }
        this.storageHandlers = {
            chrome: {
                save: (tasks) => chrome.storage.local.set({ savedTasks: tasks }),
                load: (callback) => chrome.storage.local.get(["savedTasks"], callback),
            },
            localStorage: {
                save: (tasks) => localStorage.setItem("savedTasks", JSON.stringify(tasks)),
                load: (callback) => callback({ savedTasks: JSON.parse(localStorage.getItem("savedTasks") || "{}") }),
            }
        };

        if (customStorageHandler) {
            this.addStorageHandler("custom", customStorageHandler);
        }

        this.setStorageMethod(storageMethod);
    }

    addStorageHandler(name, handler) {
        if (!handler.save || !handler.load) {
            throw new Error(`Invalid storage handler for ${name}. Must include 'save' and 'load' methods.`);
        }
        this.storageHandlers[name] = handler;
    }

    setStorageMethod(name) {
        if (!this.storageHandlers[name]) {
            throw new Error(`Unknown storage method: ${name}`);
        }
        this.storage = this.storageHandlers[name];
    }

    registerTaskHandler(name, func) {
        this.taskHandlers[name] = func;
    }

    addTask(taskId, functionName, interval = null) {
        if (this.tasks[taskId]) {
            console.warn(`Task ${taskId} already exists.`);
            return;
        }
        if (!this.taskHandlers[functionName]) {
            console.error(`Function ${functionName} is not registered.`);
            return;
        }

        // Ensure interval is valid (default to 1 second if needed)
        if (interval !== null && interval <= 0) {
            console.warn(`Invalid interval ${interval}ms for task ${taskId}. Defaulting to 1000ms.`);
            interval = 1000;
        }

        const runTask = () => {
            try {
                this.taskHandlers[functionName]();
            } catch (error) {
                console.error(`Error executing task '${taskId}':`, error);
            }

            if (interval) {
                this.tasks[taskId].timeoutId = setTimeout(runTask, interval);
            } else {
                delete this.tasks[taskId]; // Remove one-time tasks
            }
        };

        const timeoutId = setTimeout(runTask, interval || 0);
        this.tasks[taskId] = { timeoutId, functionName, interval, type: interval ? "recurring" : "one-time" };

        this.saveTasks();
        console.log(`Task ${taskId} added.`);
    }

    removeTask(taskId) {
        if (!this.tasks[taskId]) {
            console.warn(`Task ${taskId} not found.`);
            return;
        }
        clearTimeout(this.tasks[taskId].timeoutId);
        delete this.tasks[taskId];
        this.saveTasks();
        console.log(`Task ${taskId} removed.`);
    }

    clearAllTasks() {
        Object.keys(this.tasks).forEach(taskId => {
            clearTimeout(this.tasks[taskId].timeoutId);
        });
        this.tasks = {};
        this.saveTasks();
        console.log("All tasks cleared.");
    }

    listTasks() {
        const taskList = Object.entries(this.tasks).map(([taskId, { functionName, interval, type }]) => ({
            taskId,
            functionName,
            interval: interval ? `${interval / 1000} seconds` : "one-time",
            type
        }));

        console.log("Current Tasks:", taskList);
        return taskList;
    }

    saveTasks() {
        const savedTasks = Object.entries(this.tasks).reduce((acc, [taskId, { functionName, interval }]) => {
            acc[taskId] = { functionName, interval };
            return acc;
        }, {});
        this.storage.save(savedTasks);
    }

    loadTasks() {
        this.storage.load((data) => {
            if (data.savedTasks) {
                Object.entries(data.savedTasks).forEach(([taskId, { functionName, interval }]) => {
                    if (!this.tasks[taskId]) { // Prevent duplicate loading
                        this.addTask(taskId, functionName, interval);
                    }
                });
            }
        });
    }
}

/*
## Example Usage
```js
const TaskRunner = require("./taskRunner");

// Example custom storage handler (for testing)
const customStorageHandler = {
    save: (tasks) => console.log("Saving tasks:", tasks),
    load: (callback) => {
        console.log("Loading tasks...");
        callback({ savedTasks: {} });
    },
};

// Create a new TaskRunner instance with a custom storage handler
const taskRunner = new TaskRunner("custom", customStorageHandler);

// Register function handlers
taskRunner.registerTaskHandler("fetchData", () => console.log("Fetching API data..."));
taskRunner.registerTaskHandler("heartbeat", () => console.log("Heartbeat ping..."));

// Add the 'fileStorage' method dynamically
taskRunner.addStorageHandler("fileStorage", {
    save: (tasks) => require("fs").writeFileSync("tasks.json", JSON.stringify(tasks)),
    load: (callback) => {
        const fs = require("fs");
        if (fs.existsSync("tasks.json")) {
            callback({ savedTasks: JSON.parse(fs.readFileSync("tasks.json", "utf-8")) });
        } else {
            callback({ savedTasks: {} });
        }
    },
});

// Switch storage method to 'fileStorage'
taskRunner.setStorageMethod("fileStorage");

// Load persisted tasks (if any)
taskRunner.loadTasks();

// Add a one-time task
taskRunner.addTask("fetchDataTask", "fetchData", null);

// Add a recurring task every 10 seconds
taskRunner.addTask("heartbeatTask", "heartbeat", 10000);

// List tasks after 5 seconds
setTimeout(() => {
    console.log(taskRunner.listTasks());
}, 5000);

// Remove the recurring task after 30 seconds
setTimeout(() => taskRunner.removeTask("heartbeatTask"), 30000);

// Clear all tasks after 60 seconds
setTimeout(() => taskRunner.clearAllTasks(), 60000);
```
*/
