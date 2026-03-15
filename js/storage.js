import { state } from "./state.js";

export function normalizeTask(task) {
  return {
    text: task.text || "",
    completed: task.completed || false,
    priority: task.priority || "medium",
    dueDate: task.dueDate || "",
    category: task.category || "study",
    createdAt: task.createdAt || new Date().toISOString()
  };
}

export function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(state.tasks));
}

export function loadTasks() {
  const data = localStorage.getItem("tasks");

  if (!data) {
    state.tasks = [];
    return;
  }

  try {
    const parsed = JSON.parse(data);
    state.tasks = parsed.map(normalizeTask);
  } catch (error) {
    console.error("读取任务失败：", error);
    state.tasks = [];
  }
}

export function saveTheme() {
  localStorage.setItem("theme", state.theme);
}

export function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    state.theme = savedTheme;
  }
}