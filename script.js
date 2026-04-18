const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const message = document.getElementById("message");
const taskCount = document.getElementById("taskCount");
const completedCount = document.getElementById("completedCount");

let tasks = [];

// Fallback data helps the app still open directly from the folder
// because some browsers block fetch requests on the file:// protocol.
const fallbackTasks = [
  { text: "Finish homework", completed: false },
  { text: "Go to the gym", completed: false },
  { text: "Read for 20 minutes", completed: true }
];

async function loadTasks() {
  try {
    const response = await fetch("tasks.json");

    if (!response.ok) {
      throw new Error("Could not load tasks.json");
    }

    const data = await response.json();
    tasks = Array.isArray(data) ? data : [];
    showMessage("Tasks loaded from tasks.json.");
  } catch (error) {
    tasks = [...fallbackTasks];
    showMessage("Opened from the folder directly, so sample tasks were loaded instead.", true);
  }

  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "No tasks yet. Add one above to get started.";
    taskList.appendChild(emptyMessage);
    updateCounts();
    return;
  }

  tasks.forEach((task, index) => {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";

    if (task.completed) {
      taskItem.classList.add("completed");
    }

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const completeButton = document.createElement("button");
    completeButton.className = "complete-btn";
    completeButton.type = "button";
    completeButton.textContent = task.completed ? "Undo" : "Complete";
    completeButton.addEventListener("click", () => toggleTask(index));

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(index));

    taskItem.appendChild(taskText);
    taskItem.appendChild(completeButton);
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
  });

  updateCounts();
}

function addTask(taskText) {
  const trimmedText = taskText.trim();

  if (trimmedText === "") {
    showMessage("Please type a task before adding it.", true);
    return;
  }

  tasks.push({
    text: trimmedText,
    completed: false
  });

  renderTasks();
  showMessage(`Added: ${trimmedText}`);
  taskForm.reset();
  taskInput.focus();
}

function deleteTask(index) {
  const removedTask = tasks[index];
  tasks.splice(index, 1);
  renderTasks();
  showMessage(`Deleted: ${removedTask.text}`);
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();

  if (tasks[index].completed) {
    showMessage(`Completed: ${tasks[index].text}`);
  } else {
    showMessage(`Marked active again: ${tasks[index].text}`);
  }
}

function updateCounts() {
  const completedTasks = tasks.filter((task) => task.completed).length;
  taskCount.textContent = tasks.length;
  completedCount.textContent = completedTasks;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

loadTasks();
