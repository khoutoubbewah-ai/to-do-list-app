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
const recommendationTitle = document.getElementById("recommendationTitle");
const recommendationReason = document.getElementById("recommendationReason");
const useRecommendationBtn = document.getElementById("useRecommendationBtn");
const streakCount = document.getElementById("streakCount");
const rewardPoints = document.getElementById("rewardPoints");
const badgeText = document.getElementById("badgeText");

let tasks = [];
let currentFilter = "all";
let selectedDay = "Monday";
let currentRecommendationIndex = null;

const TASK_STORAGE_KEY = "dailyQuestBoard.tasks";
const REWARD_STORAGE_KEY = "dailyQuestBoard.rewards";
const priorityScores = {
  High: 3,
  Medium: 2,
  Low: 1
};

let rewardState = {
  points: 0,
  completedDates: []
};

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
    id: typeof task.id === "string" ? task.id : createTaskId(),
    text: typeof task.text === "string" ? task.text : "Untitled task",
    completed: Boolean(task.completed),
    time: typeof task.time === "string" ? task.time : "",
    priority: typeof task.priority === "string" ? task.priority : "Medium",
    category: typeof task.category === "string" ? task.category : "Life",
    day: typeof task.day === "string" ? task.day : "Monday",
    completedAt: typeof task.completedAt === "string" ? task.completedAt : ""
  };
}

function createTaskId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function loadTasks() {
  loadRewardState();

  const savedTasks = loadSavedTasks();

  if (savedTasks !== null) {
    tasks = savedTasks;
    showMessage("Saved quests loaded from this browser.");
    renderTasks();
    return;
  }

  try {
    const response = await fetch("tasks.json");

    if (!response.ok) {
      throw new Error("Could not load tasks.json");
    }

    const data = await response.json();
    tasks = Array.isArray(data) ? data.map(normalizeTask) : [];
    saveTasks();
    showMessage("Tasks loaded from tasks.json.");
  } catch (error) {
    tasks = fallbackTasks.map(normalizeTask);
    showMessage("Opened from the folder directly, so sample tasks were loaded instead.", true);
  }

  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";
  getSmartRecommendation();
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
    taskItem.dataset.taskIndex = index;

    if (task.completed) {
      taskItem.classList.add("completed");
    }

    if (index === currentRecommendationIndex) {
      taskItem.classList.add("recommended");
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
  updateRecommendation();
  updateRewards();
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
    id: createTaskId(),
    text: trimmedText,
    completed: false,
    time: timeValue,
    priority: priorityValue,
    category: categoryValue,
    day: dayValue,
    completedAt: ""
  });

  saveTasks();
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
  saveTasks();
  renderTasks();
  showMessage(`Deleted: ${removedTask.text}`);
}

function toggleTask(index) {
  const task = tasks[index];
  task.completed = !task.completed;

  if (task.completed) {
    task.completedAt = new Date().toISOString();
    recordRewardForCompletion();
  } else {
    task.completedAt = "";
  }

  saveTasks();
  renderTasks();

  if (task.completed) {
    showMessage(`Completed: ${task.text}. Reward points updated.`);
  } else {
    showMessage(`Marked active again: ${task.text}`);
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
    const recommendation = getSmartRecommendation();
    const recommendedTask = recommendation ? recommendation.task : nextTask;
    const timeText = recommendedTask.time ? ` at ${formatTime(recommendedTask.time)}` : "";
    focusPrompt.textContent = `Next quest for ${selectedDay}: ${recommendedTask.text}${timeText} in ${recommendedTask.category.toLowerCase()}.`;
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

function loadSavedTasks() {
  try {
    const savedValue = localStorage.getItem(TASK_STORAGE_KEY);

    if (savedValue === null) {
      return null;
    }

    const savedTasks = JSON.parse(savedValue);
    return Array.isArray(savedTasks) ? savedTasks.map(normalizeTask) : [];
  } catch (error) {
    return null;
  }
}

function saveTasks() {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

function loadRewardState() {
  try {
    const savedRewards = JSON.parse(localStorage.getItem(REWARD_STORAGE_KEY));

    if (savedRewards && typeof savedRewards === "object") {
      rewardState = {
        points: Number(savedRewards.points) || 0,
        completedDates: Array.isArray(savedRewards.completedDates) ? savedRewards.completedDates : []
      };
    }
  } catch (error) {
    rewardState = {
      points: 0,
      completedDates: []
    };
  }
}

function saveRewardState() {
  localStorage.setItem(REWARD_STORAGE_KEY, JSON.stringify(rewardState));
}

function recordRewardForCompletion() {
  const today = getDateKey(new Date());

  rewardState.points += 10;

  if (!rewardState.completedDates.includes(today)) {
    rewardState.completedDates.push(today);
  }

  saveRewardState();
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getCurrentStreak() {
  const completedDates = new Set(rewardState.completedDates);
  let cursor = new Date();
  let streak = 0;

  while (completedDates.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function updateRewards() {
  const streak = getCurrentStreak();
  const totalCompleted = tasks.filter((task) => task.completed).length;

  streakCount.textContent = streak;
  rewardPoints.textContent = rewardState.points;
  badgeText.textContent = getBadgeText(totalCompleted, streak);
}

function getBadgeText(totalCompleted, streak) {
  if (streak >= 5) {
    return "Badge unlocked: Week Builder. Your quest habit is becoming consistent.";
  }

  if (totalCompleted >= 10) {
    return "Badge unlocked: Quest Finisher. Ten tasks are complete.";
  }

  if (rewardState.points >= 30) {
    return "Badge unlocked: Momentum Maker. Keep stacking small wins.";
  }

  if (totalCompleted > 0) {
    return "First badge earned: Day Starter. Complete more quests to unlock rewards.";
  }

  return "Complete a quest to earn your first badge.";
}

function getSmartRecommendation() {
  const activeTasks = tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => task.day === selectedDay && !task.completed);

  if (activeTasks.length === 0) {
    currentRecommendationIndex = null;
    return null;
  }

  const [recommended] = activeTasks.sort((a, b) => {
    const priorityDifference = priorityScores[b.task.priority] - priorityScores[a.task.priority];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return getTaskMinutes(a.task.time) - getTaskMinutes(b.task.time);
  });

  currentRecommendationIndex = recommended.index;
  return recommended;
}

function getTaskMinutes(timeValue) {
  if (!timeValue) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [hourText, minuteText] = timeValue.split(":");
  return (Number(hourText) * 60) + Number(minuteText);
}

function updateRecommendation() {
  const recommendation = getSmartRecommendation();

  if (!recommendation) {
    recommendationTitle.textContent = `No active quests for ${selectedDay}`;
    recommendationReason.textContent = "Add a new task or switch to another day to get a smart recommendation.";
    useRecommendationBtn.disabled = true;
    return;
  }

  const { task } = recommendation;
  const timeText = task.time ? ` at ${formatTime(task.time)}` : "";

  recommendationTitle.textContent = task.text;
  recommendationReason.textContent = `${task.priority} priority ${task.category.toLowerCase()} quest${timeText}. Suggested because higher-priority and earlier tasks come first.`;
  useRecommendationBtn.disabled = false;
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
  saveTasks();
  renderTasks();

  if (beforeCount === tasks.length) {
    showMessage("There were no completed tasks to clear.", true);
    return;
  }

  showMessage("Cleared completed tasks.");
});

useRecommendationBtn.addEventListener("click", () => {
  if (currentRecommendationIndex === null) {
    return;
  }

  currentFilter = "all";

  filterButtons.forEach((filterButton) => {
    filterButton.classList.toggle("active", filterButton.dataset.filter === "all");
  });

  renderTasks();

  const recommendedTask = document.querySelector(`[data-task-index="${currentRecommendationIndex}"]`);

  if (recommendedTask) {
    recommendedTask.scrollIntoView({ behavior: "smooth", block: "center" });
    recommendedTask.classList.add("pulse-focus");
    setTimeout(() => recommendedTask.classList.remove("pulse-focus"), 900);
  }

  showMessage("Smart recommendation highlighted.");
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
