// ===============================
// TaskFlow - Smart Task Manager
// ===============================

// Select elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const filterInput = document.getElementById("filterInput");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const progressPercent = document.getElementById("progressPercent");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const themeBtn = document.getElementById("themeBtn");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editPriority = document.getElementById("editPriority");
const editDate = document.getElementById("editDate");
const closeModal = document.getElementById("closeModal");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let editingTaskId = null;


// ===============================
// Current Date
// ===============================

function displayCurrentDate() {

    const now = new Date();

    const day = now.toLocaleDateString("en-US", {
        weekday: "long"
    });

    const date = now.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("currentDay").textContent = day;
    document.getElementById("currentDate").textContent = date;
}

displayCurrentDate();


// ===============================
// Save Tasks
// ===============================

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );
}


// ===============================
// Add Task
// ===============================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        return;
    }

    const task = {

        id: Date.now(),

        title: title,

        priority: priorityInput.value,

        dueDate: dateInput.value,

        completed: false

    };

    tasks.push(task);

    saveTasks();

    taskForm.reset();

    priorityInput.value = "Medium";

    renderTasks();

});


// ===============================
// Render Tasks
// ===============================

function renderTasks() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const filter =
        filterInput.value;

    let filteredTasks = tasks.filter(function(task) {

        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        let matchesFilter = true;

        if (filter === "pending") {

            matchesFilter = !task.completed;

        } else if (filter === "completed") {

            matchesFilter = task.completed;

        } else if (filter === "high") {

            matchesFilter =
                task.priority === "High" &&
                !task.completed;
        }

        return matchesSearch && matchesFilter;
    });


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        taskList.appendChild(emptyState);

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredTasks.forEach(function(task) {

            const taskElement =
                createTaskElement(task);

            taskList.appendChild(taskElement);

        });
    }

    updateStatistics();
}


// ===============================
// Create Task Element
// ===============================

function createTaskElement(task) {

    const taskItem =
        document.createElement("div");

    taskItem.className = "task-item";


    // Checkbox
    const checkButton =
        document.createElement("button");

    checkButton.className = "task-check";

    if (task.completed) {

        checkButton.classList.add("completed");

        checkButton.innerHTML = "✓";
    }

    checkButton.addEventListener("click", function() {

        toggleTask(task.id);

    });


    // Task information
    const taskInfo =
        document.createElement("div");

    taskInfo.className = "task-info";


    const title =
        document.createElement("h4");

    title.textContent = task.title;

    if (task.completed) {

        title.classList.add("completed");

    }


    // Metadata
    const meta =
        document.createElement("div");

    meta.className = "task-meta";


    // Priority
    const priority =
        document.createElement("span");

    priority.className =
        `priority ${task.priority.toLowerCase()}`;

    priority.textContent =
        `${task.priority} Priority`;

    meta.appendChild(priority);


    // Due date
    if (task.dueDate) {

        const due =
            document.createElement("span");

        due.className = "due-date";

        const formattedDate =
            formatDate(task.dueDate);

        due.textContent =
            `Due ${formattedDate}`;

        if (
            isOverdue(task.dueDate) &&
            !task.completed
        ) {

            due.classList.add("overdue");

            due.textContent =
                `Overdue • ${formattedDate}`;
        }

        meta.appendChild(due);
    }


    taskInfo.appendChild(title);
    taskInfo.appendChild(meta);


    // Action buttons
    const actions =
        document.createElement("div");

    actions.className = "task-actions";


    // Edit
    const editButton =
        document.createElement("button");

    editButton.className = "action-btn";

    editButton.innerHTML = "✎";

    editButton.title = "Edit task";

    editButton.addEventListener("click", function() {

        openEditModal(task.id);

    });


    // Delete
    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "action-btn delete-btn";

    deleteButton.innerHTML = "×";

    deleteButton.title = "Delete task";

    deleteButton.addEventListener("click", function() {

        deleteTask(task.id);

    });


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    taskItem.appendChild(checkButton);
    taskItem.appendChild(taskInfo);
    taskItem.appendChild(actions);


    return taskItem;
}


// ===============================
// Toggle Task
// ===============================

function toggleTask(id) {

    tasks = tasks.map(function(task) {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };

        }

        return task;
    });

    saveTasks();

    renderTasks();
}


// ===============================
// Delete Task
// ===============================

function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(function(task) {

        return task.id !== id;

    });

    saveTasks();

    renderTasks();
}


// ===============================
// Edit Modal
// ===============================

function openEditModal(id) {

    const task =
        tasks.find(function(task) {

            return task.id === id;

        });

    if (!task) {
        return;
    }

    editingTaskId = id;

    editTitle.value = task.title;

    editPriority.value = task.priority;

    editDate.value = task.dueDate;

    editModal.classList.add("active");
}


closeModal.addEventListener("click", function() {

    editModal.classList.remove("active");

});


editModal.addEventListener("click", function(event) {

    if (event.target === editModal) {

        editModal.classList.remove("active");

    }

});


editForm.addEventListener("submit", function(event) {

    event.preventDefault();

    tasks = tasks.map(function(task) {

        if (task.id === editingTaskId) {

            return {

                ...task,

                title: editTitle.value.trim(),

                priority: editPriority.value,

                dueDate: editDate.value

            };

        }

        return task;

    });

    saveTasks();

    editModal.classList.remove("active");

    renderTasks();
});


// ===============================
// Search
// ===============================

searchInput.addEventListener("input", function() {

    renderTasks();

});


// ===============================
// Filter
// ===============================

filterInput.addEventListener("change", function() {

    renderTasks();

});


// ===============================
// Format Date
// ===============================

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {

        day: "numeric",

        month: "short"

    });
}


// ===============================
// Check Overdue
// ===============================

function isOverdue(dateString) {

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);

    const dueDate =
        new Date(dateString + "T00:00:00");

    return dueDate < today;
}


// ===============================
// Statistics
// ===============================

function updateStatistics() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;

    const pending =
        total - completed;


    let percentage = 0;

    if (total > 0) {

        percentage =
            Math.round((completed / total) * 100);

    }


    totalTasks.textContent = total;

    pendingTasks.textContent = pending;

    completedTasks.textContent = completed;

    progressPercent.textContent =
        `${percentage}%`;

    progressBar.style.width =
        `${percentage}%`;

    progressText.textContent =
        `${completed} of ${total} completed`;
}


// ===============================
// Dark / Light Mode
// ===============================

function updateThemeIcon() {

    if (document.body.classList.contains("dark")) {

        themeBtn.textContent = "☀️";

    } else {

        themeBtn.textContent = "🌙";

    }
}


themeBtn.addEventListener("click", function() {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "taskflowTheme",
        darkMode ? "dark" : "light"
    );

    updateThemeIcon();
});


const savedTheme =
    localStorage.getItem("taskflowTheme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

}

updateThemeIcon();


// ===============================
// Initial Render
// ===============================

renderTasks();