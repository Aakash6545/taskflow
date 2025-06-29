// Task management functionality
let tasks = [];
const priorityRank = { high: 0, medium: 1, low: 2 };
let currentStage = "todo";
let taskIdCounter = 1;
let userData = null;
let searchQuery = "";
let searchTimeout = null;

// DOM Elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const taskError = document.getElementById("taskError");
const stageButtons = document.querySelectorAll(".stage-btn");
const loadingOverlay = document.getElementById("loadingOverlay");
const signOutBtn = document.getElementById("signOutBtn");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

async function initializeApp() {
  // Check if user data exists
  userData = getUserData();
  if (!userData) {
    // Redirect to landing page if no user data
    window.location.href = "index.html";
    return;
  }

  // Setup user interface
  setupUserInterface();
  setupEventListeners();

  // Load tasks (either from localStorage or API)
  await loadTasks();

  // Hide loading overlay and update UI
  loadingOverlay.classList.add("hidden");
  updateUI();
}

function getUserData() {
  try {
    return JSON.parse(localStorage.getItem("taskflowUser")); // <-- change to 'taskflowUser'
  } catch (e) {
    return null;
  }
}

function setupUserInterface() {
  // Set user name and avatar
  const firstName = userData.name.split(/\s+/)[0];
  document.getElementById("userName").textContent = firstName;
  const avatarUrl = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${userData.name}`;
  document.getElementById("userAvatar").src = avatarUrl;
}

function setupEventListeners() {
  taskForm.addEventListener("submit", handleAddTask);
  signOutBtn.addEventListener("click", handleSignOut);
  searchInput.addEventListener("input", handleSearch);
  clearSearchBtn.addEventListener("click", clearSearch);
  stageButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const stage = e.currentTarget.getAttribute("data-stage");
      switchStage(stage);
    });
  });
}

function handleSignOut() {
  const modal = document.getElementById("signoutModal");
  const card = document.getElementById("signoutCard");
  modal.classList.remove("hidden");
  setTimeout(() => card.classList.add("opacity-100"), 10);
}

// Add this line to get the button reference
const confirmSignOut = document.getElementById("confirmSignOut");
const cancelSignOut = document.getElementById("cancelSignOut");
const signoutModal = document.getElementById("signoutModal");

confirmSignOut.addEventListener("click", () => {
  localStorage.removeItem("taskflowUser");
  localStorage.removeItem("taskflow_tasks");

  taskIdCounter = 1;
  window.location.href = "index.html";
});

cancelSignOut.addEventListener("click", () => {
  const modal = document.getElementById("signoutModal");
  const card = document.getElementById("signoutCard");
  // fade out card
  card.classList.remove("opacity-100");
  card.addEventListener("transitionend", () => modal.classList.add("hidden"), {
    once: true,
  });
});

// Optional backdrop-click to cancel
signoutModal.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) cancelSignOut.click();
});

async function loadTasks() {
  try {
    // Check if tasks exist in localStorage
    const storedTasks = localStorage.getItem("taskflow_tasks");

    if (storedTasks) {
      // Load from localStorage
      tasks = JSON.parse(storedTasks);
      taskIdCounter = Math.max(...tasks.map((t) => t.id || 0)) + 1;
    } else {
      // First visit - load from API
      await loadTasksFromAPI();
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
    // Initialize with empty tasks if error occurs
    tasks = [];
    taskIdCounter = 1;
  }
}

async function loadTasksFromAPI() {
  try {
    const res = await fetch("https://dummyjson.com/todos");
    const data = await res.json();

    taskIdCounter = 1;
    tasks = data.todos.slice(0, 10).map((todo) => ({
      id: taskIdCounter++,
      text: todo.todo,
      priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
      status: "todo",
      lastModified: new Date().toISOString(),
    }));

    saveTasks();
  } catch (err) {
    console.error("Error fetching todos from API:", err);
    tasks = [];
    taskIdCounter = 1;
  }
}

function handleAddTask(e) {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (!taskText) {
    showError("Please enter a task description");
    return;
  }

  const task = {
    id: taskIdCounter++,
    text: taskText,
    priority: priority,
    status: currentStage === "todo" ? "todo" : "todo", // Always add to todo initially
    lastModified: new Date().toISOString(),
  };

  tasks.push(task);
  taskInput.value = "";
  prioritySelect.value = "medium";
  hideError();
  saveTasks();
  updateUI();

  // Show success notification
  showNotification("Task added successfully! 🎉", "success");
}

function switchStage(stage) {
  currentStage = stage;

  // Update button states
  stageButtons.forEach((btn) => {
    btn.classList.remove("stage-active");
    if (btn.getAttribute("data-stage") === stage) {
      btn.classList.add("stage-active");
    }
  });

  // Show/hide stage containers
  document.querySelectorAll('[id$="Stage"]').forEach((container) => {
    container.classList.add("hidden");
  });
  document.getElementById(stage + "Stage").classList.remove("hidden");
  document.getElementById(stage + "Stage").classList.add("fade-in");
}

function createTaskElement(task) {
  const priorityClass = `priority-${task.priority}`;
  const lastModified = formatDateTime(task.lastModified);

  const taskElement = document.createElement("div");
  taskElement.className = `task-card rounded-xl p-4 relative`;
  taskElement.setAttribute("data-task-id", task.id);

  taskElement.innerHTML = `
                <!-- Delete button - positioned at top right -->
                <button class="delete-btn absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm transition-all duration-200 opacity-70 hover:opacity-100 z-10">
                    <i class="fas fa-trash"></i>
                </button>
                
                <div class="flex items-start justify-between pr-8 sm:pr-10">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center mb-2">
                            <div class="priority-indicator mr-2"></div>
                            <span class="text-xs text-indigo-200 capitalize">${
                              task.priority
                            } Priority</span>
                        </div>
                        <p class="text-white font-medium mb-2 break-words leading-relaxed">${
                          task.text
                        }</p>
                        <div class="text-xs text-indigo-200">
                            <i class="fas fa-clock mr-1"></i>
                            Last modified: ${lastModified}
                        </div>
                    </div>
                </div>
                <div class="desktop-buttons">
                    ${getTaskButtons(task)}
                </div>
                <div class="mobile-buttons">
                    ${getTaskButtons(task)}
                </div>
            `;

  // Add event listeners for buttons
  setTimeout(() => {
    addTaskEventListeners(taskElement, task);
  }, 0);

  return taskElement;
}

function addTaskEventListeners(taskElement, task) {
  // Attach listeners to both desktop and mobile buttons
  const buttonSets = [
    ...taskElement.querySelectorAll(".desktop-buttons button"),
    ...taskElement.querySelectorAll(".mobile-buttons button"),
  ];

  buttonSets.forEach((btn) => {
    if (btn.classList.contains("complete-btn")) {
      btn.addEventListener("click", () => markAsCompleted(task.id));
    }
    if (btn.classList.contains("archive-btn")) {
      btn.addEventListener("click", () => archiveTask(task.id));
    }
    if (btn.classList.contains("move-to-todo-btn")) {
      btn.addEventListener("click", () => moveToTodo(task.id));
    }
    if (btn.classList.contains("move-to-completed-btn")) {
      btn.addEventListener("click", () => moveToCompleted(task.id));
    }
  });

  // Add delete button listener - THIS WAS MISSING!
  const deleteBtn = taskElement.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent any parent event handlers
      deleteTask(task.id);
    });
  }
}

// New deleteTask function - add this to your script
function deleteTask(taskId) {
  const id = Number(taskId);
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex !== -1) {
    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    saveTasks();
    updateUI();
    showNotification(`Task deleted successfully! 🗑️`, "warning");
  }
}

function getTaskButtons(task) {
  if (task.status === "todo") {
    return `
                    <button class="complete-btn btn-success text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ">
                        <i class="fas fa-check mr-1"></i>
                        <span class="hidden sm:inline">Mark as Completed</span>
                        <span class="sm:hidden">Complete</span>
                    </button>
                    <button class="archive-btn bg-white text-black px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ">
                        <i class="fas fa-archive mr-1"></i>
                        <span class="hidden sm:inline">Archive</span>
                        <span class="sm:hidden">Archive</span>
                    </button>
                `;
  } else if (task.status === "completed") {
    return `
                    <button class="move-to-todo-btn btn-secondary text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ">
                        <i class="fas fa-undo mr-1"></i>
                        <span class="hidden sm:inline">Move to Todo</span>
                        <span class="sm:hidden">To Todo</span>
                    </button>
                    <button class="archive-btn bg-white text-black px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ">
                        <i class="fas fa-archive mr-1"></i>
                        <span class="hidden sm:inline">Archive</span>
                        <span class="sm:hidden">Archive</span>
                    </button>
                `;
  } else {
    // archived
    return `
                    <button class="move-to-todo-btn btn-secondary text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ">
                        <i class="fas fa-undo mr-1"></i>
                        <span class="hidden sm:inline">Move to Todo</span>
                        <span class="sm:hidden">To Todo</span>
                    </button>
                    <button class="move-to-completed-btn btn-success text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ">
                        <i class="fas fa-check mr-1"></i>
                        <span class="hidden sm:inline">Move to Completed</span>
                        <span class="sm:hidden">Complete</span>
                    </button>
                `;
  }
}

function markAsCompleted(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = "completed";
    task.lastModified = new Date().toISOString();
    saveTasks();
    updateUI();
    showNotification("Task completed! Great job! 🎉", "success");
  }
}

function archiveTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = "archived";
    task.lastModified = new Date().toISOString();
    saveTasks();
    updateUI();
    showNotification("Task archived successfully 📁", "info");
  }
}

function moveToTodo(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = "todo";
    task.lastModified = new Date().toISOString();
    saveTasks();
    updateUI();
    showNotification("Task moved to Todo ↩️", "info");
  }
}

function moveToCompleted(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = "completed";
    task.lastModified = new Date().toISOString();
    saveTasks();
    updateUI();
    showNotification("Task moved to Completed ✅", "success");
  }
}

function updateUI() {
  updateTaskCounts();
  renderTasks();
}

function updateTaskCounts() {
  const todoCounts = tasks.filter((t) => t.status === "todo").length;
  const completedCounts = tasks.filter((t) => t.status === "completed").length;
  const archivedCounts = tasks.filter((t) => t.status === "archived").length;

  document.getElementById("todoCount").textContent = todoCounts;
  document.getElementById("completedCount").textContent = completedCounts;
  document.getElementById("archivedCount").textContent = archivedCounts;
}

function renderTasks() {
  const todoContainer = document.getElementById("todoTasks");
  const completedContainer = document.getElementById("completedTasks");
  const archivedContainer = document.getElementById("archivedTasks");

  const todoEmpty = document.getElementById("todoEmpty");
  const completedEmpty = document.getElementById("completedEmpty");
  const archivedEmpty = document.getElementById("archivedEmpty");

  // Clear containers
  todoContainer.innerHTML = "";
  completedContainer.innerHTML = "";
  archivedContainer.innerHTML = "";

  // Filter tasks by status
  const todoTasks = filterTasksBySearch(
    tasks.filter((t) => t.status === "todo")
  );
  const completedTasks = filterTasksBySearch(
    tasks.filter((t) => t.status === "completed")
  );
  const archivedTasks = filterTasksBySearch(
    tasks.filter((t) => t.status === "archived")
  );

  //sorting the tasks by priority
  todoTasks.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  completedTasks.sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
  );
  archivedTasks.sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
  );

  // Render todo tasks
  if (todoTasks.length === 0) {
    todoEmpty.classList.remove("hidden");
    if (searchQuery) {
      todoEmpty.innerHTML = `
      <i class="fas fa-search text-3xl sm:text-4xl mb-4 opacity-50"></i>
      <p class="text-base sm:text-lg">No matching todo tasks</p>
      <p class="text-sm">Try adjusting your search terms</p>
    `;
    } else {
      todoEmpty.innerHTML = `
      <i class="fas fa-clipboard-list text-3xl sm:text-4xl mb-4 opacity-50"></i>
      <p class="text-base sm:text-lg">No todo tasks</p>
      <p class="text-sm">Add a new task to get started!</p>
    `;
    }
  } else {
    todoEmpty.classList.add("hidden");
    todoTasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      taskElement.classList.add("slide-in");
      todoContainer.appendChild(taskElement);
    });
  }

  // Render completed tasks
  if (completedTasks.length === 0) {
    completedEmpty.classList.remove("hidden");
    if (searchQuery) {
      completedEmpty.innerHTML = `
      <i class="fas fa-search text-3xl sm:text-4xl mb-4 opacity-50"></i>
      <p class="text-base sm:text-lg">No matching completed tasks</p>
      <p class="text-sm">Try adjusting your search terms</p>
    `;
    } else {
      completedEmpty.innerHTML = `
      <i class="fas fa-trophy text-3xl sm:text-4xl mb-4 opacity-50"></i>
      <p class="text-base sm:text-lg">No completed tasks yet</p>
      <p class="text-sm">Complete some tasks to see them here!</p>
    `;
    }
  } else {
    completedEmpty.classList.add("hidden");
    completedTasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      taskElement.classList.add("slide-in");
      completedContainer.appendChild(taskElement);
    });
  }

  // Render archived tasks
  if (archivedTasks.length === 0) {
    archivedEmpty.classList.remove("hidden");
    if (searchQuery) {
      archivedEmpty.innerHTML = `
      <i class="fas fa-search text-3xl sm:text-4xl mb-4 opacity-50"></i>
      <p class="text-base sm:text-lg">No matching archived tasks</p>
      <p class="text-sm">Try adjusting your search terms</p>
    `;
    } else {
      archivedEmpty.innerHTML = `
      <i class="fas fa-box text-3xl sm:text-4xl mb-4 opacity-50"></i>
      <p class="text-base sm:text-lg">No archived tasks</p>
      <p class="text-sm">Archive completed tasks for future reference!</p>
    `;
    }
  } else {
    archivedEmpty.classList.add("hidden");
    archivedTasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      taskElement.classList.add("slide-in");
      archivedContainer.appendChild(taskElement);
    });
  }
}

function saveTasks() {
  try {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
    showNotification("Error saving tasks. Please try again.", "error");
  }
}

function formatDateTime(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }
  } catch (error) {
    return "Unknown";
  }
}

function showError(message) {
  taskError.textContent = message;
  taskError.classList.remove("hidden");
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  taskError.classList.add("hidden");
}

function showNotification(message, type = "info") {
  const CONTAINER_ID = "toast-container";

  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.className = "fixed top-12 right-6 flex flex-col space-y-2 z-50";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = [
    "transform translate-x-full",
    "flex items-center space-x-2",
    "bg-black bg-opacity-20 backdrop-blur-sm",
    "px-5 py-3 rounded-lg shadow-lg",
    "text-white text-sm font-medium",
    "transition-transform duration-300 ease-out",
  ].join(" ");

  let iconHtml, bgClass;
  switch (type) {
    case "success":
      iconHtml = '<i class="fas fa-check-circle"></i>';
      bgClass = "bg-green-600";
      break;
    case "error":
      iconHtml = '<i class="fas fa-times-circle"></i>';
      bgClass = "bg-red-600";
      break;
    case "warning":
      iconHtml = '<i class="fas fa-exclamation-triangle"></i>';
      bgClass = "bg-yellow-600";
      break;
    default:
      iconHtml = '<i class="fas fa-info-circle"></i>';
      bgClass = "bg-blue-600";
  }

  toast.innerHTML = `
    <span class="${bgClass} p-1 rounded-full text-lg flex-shrink-0">${iconHtml}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-x-full");
  });

  setTimeout(() => {
    toast.classList.add("translate-x-full");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 3000);
}

// Focus task input when page loads
window.addEventListener("load", function () {
  setTimeout(() => {
    if (taskInput) {
      taskInput.focus();
    }
  }, 500);
});

// Search functionality
function handleSearch(e) {
  const newQuery = e.target.value.toLowerCase().trim();

  // Show/hide clear button immediately for better UX
  if (newQuery) {
    clearSearchBtn.classList.remove("hidden");
  } else {
    clearSearchBtn.classList.add("hidden");
  }

  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Set new timeout - only search after user stops typing for 300ms
  searchTimeout = setTimeout(() => {
    searchQuery = newQuery;
    updateUI();
  }, 800);
}

function clearSearch() {
  searchInput.value = "";
  searchQuery = "";
  clearSearchBtn.classList.add("hidden");

  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  updateUI();
}

function filterTasksBySearch(taskArray) {
  if (!searchQuery) return taskArray;

  return taskArray.filter(
    (task) =>
      task.text.toLowerCase().includes(searchQuery) ||
      task.priority.toLowerCase().includes(searchQuery)
  );
}
