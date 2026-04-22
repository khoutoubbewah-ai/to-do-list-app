const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskTime = document.getElementById("taskTime");
const taskPriority = document.getElementById("taskPriority");
const taskCategory = document.getElementById("taskCategory");
const taskDay = document.getElementById("taskDay");
const message = document.getElementById("message");
const taskCount = document.getElementById("taskCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const progressCount = document.getElementById("progressCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");
const dayButtons = document.querySelectorAll(".day-btn");
const dayPhase = document.getElementById("dayPhase");
const todayLabel = document.getElementById("todayLabel");
const selectedDayLabel = document.getElementById("selectedDayLabel");
const storyLine = document.getElementById("storyLine");
const focusPrompt = document.getElementById("focusPrompt");
const progressBar = document.getElementById("progressBar");
const progressSummary = document.getElementById("progressSummary");

let tasks = [];
let currentFilter = "all";
let selectedDay = "Monday";

// Fallback data helps the app still open directly from the folder
// because some browsers block fetch requests on the file:// protocol.
const fallbackTasks = [
  { text: "Sketch one poster idea", completed: false, time: "09:00", priority: "High", category: "Creative", day: "Monday" },
  { text: "Review class notes", completed: false, time: "13:30", priority: "Medium", category: "Study", day: "Tuesday" },
  { text: "Take a sunset walk", completed: true, time: "18:45", priority: "Low", category: "Wellness", day: "Wednesday" }
];

const phaseScenes = {
  morning: {
    label: "Morning Reset",
    story: "Morning is for opening the day gently and choosing one clear direction.",
    prompt: "Start with your highest-priority task and build momentum before the day gets noisy."
  },
  afternoon: {
    label: "Afternoon Flow",
    story: "Afternoon is for steady progress and visible movement across your board.",
    prompt: "Pick the next active task and keep the middle of the day focused and practical."
  },
  evening: {
    label: "Evening Landing",
    story: "Evening is for closing loops, reflecting, and leaving tomorrow a lighter list.",
    prompt: "Finish a smaller task, clear completed items, and leave a calm ending to the day."
  }
};

function normalizeTask(task) {
  return {
    text: typeof task.text === "string" ? task.text : "Untitled task",
    completed: Boolean(task.completed),
    time: typeof task.time === "string" ? task.time : "",
    priority: typeof task.priority === "string" ? task.priority : "Medium",
    category: typeof task.category === "string" ? task.category : "Life",
    day: typeof task.day === "string" ? task.day : "Monday"
  };
}

async function loadTasks() {
  try {
    const response = await fetch("tasks.json");

    if (!response.ok) {
      throw new Error("Could not load tasks.json");
    }

    const data = await response.json();
    tasks = Array.isArray(data) ? data.map(normalizeTask) : [];
    showMessage("Tasks loaded from tasks.json.");
  } catch (error) {
    tasks = fallbackTasks.map(normalizeTask);
    showMessage("Opened from the folder directly, so sample tasks were loaded instead.", true);
  }

  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = tasks.length === 0
      ? "No tasks yet. Add one above to get started."
      : "No tasks match this filter right now.";
    taskList.appendChild(emptyMessage);
    updateCounts();
    return;
  }

  visibleTasks.forEach(({ task, index }) => {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";

    if (task.completed) {
      taskItem.classList.add("completed");
    }

    const taskMain = document.createElement("div");
    taskMain.className = "task-main";

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";

    if (task.time) {
      const timeChip = document.createElement("span");
      timeChip.className = "meta-chip";
      timeChip.textContent = `Time: ${formatTime(task.time)}`;
      taskMeta.appendChild(timeChip);
    }

    const categoryChip = document.createElement("span");
    categoryChip.className = `meta-chip category-${task.category.toLowerCase()}`;
    categoryChip.textContent = task.category;
    taskMeta.appendChild(categoryChip);

    const priorityChip = document.createElement("span");
    priorityChip.className = `meta-chip priority-${task.priority.toLowerCase()}`;
    priorityChip.textContent = `${task.priority} Priority`;
    taskMeta.appendChild(priorityChip);

    taskMain.appendChild(taskText);
    taskMain.appendChild(taskMeta);

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

    taskItem.appendChild(taskMain);
    taskItem.appendChild(completeButton);
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
  });

  updateCounts();
  updateStoryPanel();
}

function getVisibleTasks() {
  return tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => {
      if (task.day !== selectedDay) {
        return false;
      }

      if (currentFilter === "active") {
        return !task.completed;
      }

      if (currentFilter === "completed") {
        return task.completed;
      }

      return true;
    });
}

function addTask(taskText, timeValue, priorityValue, categoryValue, dayValue) {
  const trimmedText = taskText.trim();

  if (trimmedText === "") {
    showMessage("Please type a task before adding it.", true);
    return;
  }

  tasks.push({
    text: trimmedText,
    completed: false,
    time: timeValue,
    priority: priorityValue,
    category: categoryValue,
    day: dayValue
  });

  renderTasks();
  showMessage(`Added: ${trimmedText} for ${dayValue}${timeValue ? ` at ${formatTime(timeValue)}` : ""}`);
  taskForm.reset();
  taskPriority.value = "Medium";
  taskCategory.value = "Creative";
  taskDay.value = selectedDay;
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
  const dayTasks = tasks.filter((task) => task.day === selectedDay);
  const completedTasks = dayTasks.filter((task) => task.completed).length;
  const pendingTasks = dayTasks.length - completedTasks;
  const progress = dayTasks.length === 0 ? 0 : Math.round((completedTasks / dayTasks.length) * 100);

  taskCount.textContent = dayTasks.length;
  completedCount.textContent = completedTasks;
  pendingCount.textContent = pendingTasks;
  progressCount.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
  progressSummary.textContent = getProgressSummary(progress, pendingTasks);
  selectedDayLabel.textContent = `Showing tasks for ${selectedDay}.`;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function formatTime(timeValue) {
  const [hourText, minuteText] = timeValue.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return timeValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2024, 0, 1, hour, minute));
}

function getCurrentPhase() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "morning";
  }

  if (hour < 18) {
    return "afternoon";
  }

  return "evening";
}

function updateStoryPanel() {
  const phase = getCurrentPhase();
  const scene = phaseScenes[phase];
  const nextTask = tasks.find((task) => task.day === selectedDay && !task.completed);
  const dayTasks = tasks.filter((task) => task.day === selectedDay);

  dayPhase.textContent = scene.label;
  storyLine.textContent = scene.story;

  if (nextTask) {
    const timeText = nextTask.time ? ` at ${formatTime(nextTask.time)}` : "";
    focusPrompt.textContent = `Next quest for ${selectedDay}: ${nextTask.text}${timeText} in ${nextTask.category.toLowerCase()}.`;
  } else if (dayTasks.length > 0) {
    focusPrompt.textContent = `All quests for ${selectedDay} are complete. The board is clear for that day.`;
  } else {
    focusPrompt.textContent = `${scene.prompt} Add a task for ${selectedDay} to start the plan.`;
  }
}

function getProgressSummary(progress, pendingTasks) {
  const dayTasks = tasks.filter((task) => task.day === selectedDay);

  if (dayTasks.length === 0) {
    return `0% complete. Add your first quest for ${selectedDay}.`;
  }

  if (progress === 100) {
    return `100% complete. Every ${selectedDay} task is finished.`;
  }

  if (progress >= 60) {
    return `${progress}% complete. Only ${pendingTasks} ${selectedDay} task${pendingTasks === 1 ? "" : "s"} left.`;
  }

  return `${progress}% complete. Keep shaping ${selectedDay} one task at a time.`;
}

function updateDateLabel() {
  todayLabel.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(new Date());
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value, taskTime.value, taskPriority.value, taskCategory.value, taskDay.value);
});

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    taskForm.reset();
    taskPriority.value = "Medium";
    taskCategory.value = "Creative";
    taskDay.value = selectedDay;
    showMessage("Draft cleared. Start a new quest when you are ready.");
  }
});

clearCompletedBtn.addEventListener("click", () => {
  const beforeCount = tasks.length;
  tasks = tasks.filter((task) => !task.completed);
  renderTasks();

  if (beforeCount === tasks.length) {
    showMessage("There were no completed tasks to clear.", true);
    return;
  }

  showMessage("Cleared completed tasks.");
});

dayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedDay = button.dataset.day;
    taskDay.value = selectedDay;

    dayButtons.forEach((dayButton) => {
      dayButton.classList.toggle("active", dayButton === button);
    });

    renderTasks();
    showMessage(`Showing quests for ${selectedDay}.`);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle("active", filterButton === button);
    });

    renderTasks();
    showMessage(`Showing ${currentFilter} tasks.`);
  });
});

updateDateLabel();
taskDay.value = selectedDay;
loadTasks();
