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
const importBtn = document.getElementById("importBtn");
const exportBtn = document.getElementById("exportBtn");
const fileInput = document.getElementById("fileInput");

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

  // Load tasks 
  await loadTasks();

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
  const firstName = userData.name.split(/\s+/)[0];
  document.getElementById("userName").textContent = firstName;
  const avatarUrl = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${userData.name}`;
  document.getElementById("userAvatar").src = avatarUrl;
}


document.getElementById('importBtnMobile').addEventListener('click', function() {
  document.getElementById('importBtn').click(); 
});

document.getElementById('exportBtnMobile').addEventListener('click', function() {
  document.getElementById('exportBtn').click(); 
});

function setupEventListeners() {
  taskForm.addEventListener("submit", handleAddTask);
  signOutBtn.addEventListener("click", handleSignOut);
  searchInput.addEventListener("input", handleSearch);
  clearSearchBtn.addEventListener("click", clearSearch);
  importBtn.addEventListener("click", handleImportClick);
  exportBtn.addEventListener("click", handleExportTasks);
  fileInput.addEventListener("change", handleFileImport);
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
  
  card.classList.remove("opacity-100");
  card.addEventListener("transitionend", () => modal.classList.add("hidden"), {
    once: true,
  });
});


signoutModal.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) cancelSignOut.click();
});

async function loadTasks() {
  try {
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
    status: currentStage === "todo" ? "todo" : "todo", // Always add to todo initially to handle the completed status
    lastModified: new Date().toISOString(),
  };

  tasks.push(task);
  taskInput.value = "";
  prioritySelect.value = "medium";
  hideError();
  saveTasks();
  updateUI();

  
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

  setTimeout(() => {
    addTaskEventListeners(taskElement, task);
  }, 0);

  return taskElement;
}

function addTaskEventListeners(taskElement, task) {
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

  const deleteBtn = taskElement.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); 
      deleteTask(task.id);
    });
  }
}

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

  
  if (newQuery) {
    clearSearchBtn.classList.remove("hidden");
  } else {
    clearSearchBtn.classList.add("hidden");
  }

  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  
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

function handleImportClick() {
  fileInput.click();
}

function handleExportTasks() {
  try {
    const exportData = {
      tasks: tasks,
      exportDate: new Date().toISOString(),
      version: "1.0",
      totalTasks: tasks.length,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);

    const timestamp = new Date().toISOString().split("T")[0];
    link.download = `taskflow-tasks-${timestamp}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);

    showNotification(
      `Tasks exported successfully! 📥 (${tasks.length} tasks)`,
      "success"
    );
  } catch (error) {
    console.error("Export error:", error);
    showNotification("Failed to export tasks. Please try again.", "error");
  }
}

function handleFileImport(event) {
  const file = event.target.files[0];

  if (!file) return;

  // Validate file type
  if (
    !file.type.includes("json") &&
    !file.name.toLowerCase().endsWith(".json")
  ) {
    showNotification("Please select a valid JSON file.", "error");
    resetFileInput();
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification(
      "File too large. Please select a file smaller than 5MB.",
      "error"
    );
    resetFileInput();
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const importData = JSON.parse(e.target.result);
      validateAndImportTasks(importData);
    } catch (error) {
      console.error("JSON parsing error:", error);
      showNotification(
        "Invalid JSON file. Please check the file format.",
        "error"
      );
      resetFileInput();
    }
  };

  reader.onerror = function () {
    showNotification("Error reading file. Please try again.", "error");
    resetFileInput();
  };

  reader.readAsText(file);
}

function validateAndImportTasks(importData) {
  try {
    // Check if it's a valid TaskFlow export
    if (!importData.tasks || !Array.isArray(importData.tasks)) {
      showNotification(
        "Invalid file format. Expected TaskFlow export file.",
        "error"
      );
      resetFileInput();
      return;
    }

    const importedTasks = importData.tasks;

    
    const validTasks = [];
    let invalidCount = 0;

    importedTasks.forEach((task, index) => {
      if (validateTaskStructure(task)) {
        
        const validTask = {
          id: taskIdCounter++,
          text: String(task.text || `Imported task ${index + 1}`).trim(),
          priority: ["high", "medium", "low"].includes(task.priority)
            ? task.priority
            : "medium",
          status: ["todo", "completed", "archived"].includes(task.status)
            ? task.status
            : "todo",
          lastModified: task.lastModified || new Date().toISOString(),
        };
        validTasks.push(validTask);
      } else {
        invalidCount++;
      }
    });

    if (validTasks.length === 0) {
      showNotification("No valid tasks found in the file.", "error");
      resetFileInput();
      return;
    }

    // Show confirmation modal
    showImportConfirmation(validTasks, invalidCount);
  } catch (error) {
    console.error("Import validation error:", error);
    showNotification(
      "Error processing import file. Please check the file format.",
      "error"
    );
    resetFileInput();
  }
}

function validateTaskStructure(task) {
  return (
    task &&
    typeof task === "object" &&
    (task.text || task.title || task.description) &&
    typeof (task.text || task.title || task.description) === "string"
  );
}

function showImportConfirmation(validTasks, invalidCount) {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50";
  modal.id = "importModal";

  modal.innerHTML = `
    <div class="glass-effect rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 opacity-0 transition-opacity duration-200" id="importCard">
      <h3 class="text-lg font-semibold text-slate-100 mb-2 flex items-center">
        <i class="fas fa-file-import mr-2 text-blue-400"></i>
        Confirm Import
      </h3>
      <div class="text-slate-400 mb-4 text-sm space-y-2">
        <p><span class="text-emerald-400 font-medium">${
          validTasks.length
        }</span> valid tasks found</p>
        ${
          invalidCount > 0
            ? `<p><span class="text-yellow-400 font-medium">${invalidCount}</span> invalid tasks will be skipped</p>`
            : ""
        }
        <p class="text-slate-500">This will add tasks to your existing collection.</p>
      </div>
      <div class="flex justify-end space-x-3">
        <button id="cancelImport" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-slate-200 transition-all duration-200 text-sm border border-slate-700/50 hover:border-slate-600/50">
          Cancel
        </button>
        <button id="confirmImport" class="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 text-sm border border-blue-500/20 hover:border-blue-500/30">
          Import Tasks
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const card = modal.querySelector("#importCard");
  setTimeout(() => card.classList.add("opacity-100"), 10);

  // Event listeners
  modal.querySelector("#cancelImport").addEventListener("click", () => {
    closeImportModal(modal);
    resetFileInput();
  });

  modal.querySelector("#confirmImport").addEventListener("click", () => {
    executeImport(validTasks, invalidCount);
    closeImportModal(modal);
    resetFileInput();
  });

  // Backdrop click to cancel
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeImportModal(modal);
      resetFileInput();
    }
  });
}

function closeImportModal(modal) {
  const card = modal.querySelector("#importCard");
  card.classList.remove("opacity-100");
  card.addEventListener(
    "transitionend",
    () => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
    },
    { once: true }
  );
}

function executeImport(validTasks, invalidCount) {
  tasks.push(...validTasks);
  saveTasks();
  updateUI();

  let message = `Successfully imported ${validTasks.length} tasks! 📁`;
  if (invalidCount > 0) {
    message += ` (${invalidCount} invalid tasks skipped)`;
  }

  showNotification(message, "success");
}

function resetFileInput() {
  fileInput.value = "";
}
