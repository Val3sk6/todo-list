import { state } from "./state.js";
import { saveTasks, saveTheme } from "./storage.js";
import { getPriorityValue } from "./utils.js";
import { renderApp, applyTheme } from "./ui.js";

export function getTaskStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(task => task.completed).length;
  const active = total - completed;

  return { total, completed, active };
}

export function getFilteredTasks(taskList) {
  if (state.currentFilter === "active") {
    return taskList.filter(task => !task.completed);
  }
  if (state.currentFilter === "completed") {
    return taskList.filter(task => task.completed);
  }
  return taskList;
}

export function getCategoryFilteredTasks(taskList) {
  if (state.currentCategoryFilter === "all") {
    return taskList;
  }

  return taskList.filter(task => task.category === state.currentCategoryFilter);
}

export function getSearchedTasks(taskList) {
  if (!state.searchKeyword) return taskList;

  return taskList.filter(task =>
    task.text.toLowerCase().includes(state.searchKeyword.toLowerCase())
  );
}

export function sortTasks(taskList) {
  const sorted = [...taskList];

  sorted.sort((a, b) => {
    switch (state.currentSort) {
      case "created-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "created-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "due-asc":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case "due-desc":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      case "priority-desc":
        return getPriorityValue(b.priority) - getPriorityValue(a.priority);
      case "priority-asc":
        return getPriorityValue(a.priority) - getPriorityValue(b.priority);
      default:
        return 0;
    }
  });

  return sorted;
}

export function getProcessedTasks() {
  let result = [...state.tasks];
  result = getFilteredTasks(result);
  result = getCategoryFilteredTasks(result);
  result = getSearchedTasks(result);
  result = sortTasks(result);
  return result;
}

export function resetTaskForm() {
  document.getElementById("taskInput").value = "";
  document.getElementById("prioritySelect").value = "medium";
  document.getElementById("categorySelect").value = "study";
  document.getElementById("dueDateInput").value = "";
}

export function addTask() {
  const taskInput = document.getElementById("taskInput");
  const prioritySelect = document.getElementById("prioritySelect");
  const categorySelect = document.getElementById("categorySelect");
  const dueDateInput = document.getElementById("dueDateInput");

  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const category = categorySelect.value;
  const dueDate = dueDateInput.value;

  if (text === "") {
    alert("请输入任务内容！");
    return;
  }

  state.tasks.push({
    text,
    completed: false,
    priority,
    category,
    dueDate,
    createdAt: new Date().toISOString()
  });

  saveTasks();
  resetTaskForm();
  renderApp();
}

export function deleteTask(index) {
  state.tasks.splice(index, 1);
  saveTasks();
  renderApp();
}

export function toggleTaskCompleted(index, completed) {
  state.tasks[index].completed = completed;
  saveTasks();
  renderApp();
}

export function updateTask(index, updatedFields) {
  state.tasks[index] = {
    ...state.tasks[index],
    ...updatedFields
  };
  saveTasks();
  renderApp();
}

export function clearCompletedTasks() {
  state.tasks = state.tasks.filter(task => !task.completed);
  saveTasks();
  renderApp();
}

export function markAllCompleted() {
  state.tasks = state.tasks.map(task => ({
    ...task,
    completed: true
  }));
  saveTasks();
  renderApp();
}

export function markAllActive() {
  state.tasks = state.tasks.map(task => ({
    ...task,
    completed: false
  }));
  saveTasks();
  renderApp();
}

export function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  saveTheme();
  applyTheme();
}

export function exportTasksAsJSON() {
  const dataStr = JSON.stringify(state.tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "todo-tasks.json";
  link.click();

  URL.revokeObjectURL(url);
}

export function importTasksFromJSON(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {
    try {
      const parsed = JSON.parse(event.target.result);

      if (!Array.isArray(parsed)) {
        alert("导入失败：JSON 格式不正确，必须是任务数组！");
        return;
      }

      state.tasks = parsed.map(task => ({
        text: task.text || "",
        completed: !!task.completed,
        priority: task.priority || "medium",
        category: task.category || "study",
        dueDate: task.dueDate || "",
        createdAt: task.createdAt || new Date().toISOString()
      }));

      saveTasks();
      renderApp();
      alert("导入成功！");
    } catch (error) {
      console.error(error);
      alert("导入失败：文件内容不是合法 JSON！");
    }
  };

  reader.readAsText(file);
}