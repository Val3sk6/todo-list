import { state } from "./state.js";
import { saveTasks, saveTheme } from "./storage.js";
import { getPriorityValue } from "./utils.js";
import { renderApp, applyTheme } from "./ui.js";
import { showToast } from "./feedback.js";

export function getTaskStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(task => task.completed).length;
  const active = total - completed;

  return { total, completed, active };
}

export function getCompletionRate() {
  const total = state.tasks.length;
  if (total === 0) return 0;

  const completed = state.tasks.filter(task => task.completed).length;
  return Math.round((completed / total) * 100);
}

export function getTodayDueCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return state.tasks.filter(task => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }).length;
}

export function getOverdueCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return state.tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
}

export function getCategoryStats() {
  const base = {
    study: 0,
    life: 0,
    sport: 0,
    work: 0
  };

  state.tasks.forEach(task => {
    if (base[task.category] !== undefined) {
      base[task.category]++;
    }
  });

  return base;
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

export function getStarredFilteredTasks(taskList) {
  if (!state.showStarredOnly) return taskList;
  return taskList.filter(task => task.starred);
}

export function getSearchedTasks(taskList) {
  if (!state.searchKeyword) return taskList;

  return taskList.filter(task =>
    task.text.toLowerCase().includes(state.searchKeyword.toLowerCase()) ||
    (task.tags || []).some(tag =>
      tag.toLowerCase().includes(state.searchKeyword.toLowerCase())
    )
  );
}

export function sortTasks(taskList) {
  const sorted = [...taskList];

  sorted.sort((a, b) => {
    if (a.starred !== b.starred) {
      return Number(b.starred) - Number(a.starred);
    }

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
  result = getStarredFilteredTasks(result);
  result = getSearchedTasks(result);
  result = sortTasks(result);
  return result;
}

export function resetTaskForm() {
  document.getElementById("taskInput").value = "";
  document.getElementById("prioritySelect").value = "medium";
  document.getElementById("categorySelect").value = "study";
  document.getElementById("dueDateInput").value = "";

  const tagsInput = document.getElementById("tagsInput");
  if (tagsInput) {
    tagsInput.value = "";
  }
}

export function addTask() {
  const taskInput = document.getElementById("taskInput");
  const prioritySelect = document.getElementById("prioritySelect");
  const categorySelect = document.getElementById("categorySelect");
  const dueDateInput = document.getElementById("dueDateInput");
  const tagsInput = document.getElementById("tagsInput");

  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const category = categorySelect.value;
  const dueDate = dueDateInput.value;
  const tags = tagsInput
    ? tagsInput.value
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean)
    : [];

  if (text === "") {
    showToast("请输入任务内容！", "error");
    return;
  }

  state.tasks.push({
    text,
    completed: false,
    priority,
    category,
    dueDate,
    createdAt: new Date().toISOString(),
    starred: false,
    tags
  });

  saveTasks();
  resetTaskForm();
  renderApp();
  showToast("任务已添加", "success");
}

export function deleteTask(index) {
  state.tasks.splice(index, 1);
  saveTasks();
  renderApp();
  showToast("任务已删除", "info");
}

export function toggleTaskCompleted(index, completed) {
  state.tasks[index].completed = completed;
  saveTasks();
  renderApp();
}

export function toggleTaskStarred(index) {
  state.tasks[index].starred = !state.tasks[index].starred;
  saveTasks();
  renderApp();

  showToast(
    state.tasks[index].starred ? "已加入收藏" : "已取消收藏",
    "info"
  );
}

export function updateTask(index, updatedFields) {
  state.tasks[index] = {
    ...state.tasks[index],
    ...updatedFields
  };
  saveTasks();
  renderApp();
  showToast("任务已更新", "success");
}

export function clearCompletedTasks() {
  state.tasks = state.tasks.filter(task => !task.completed);
  saveTasks();
  renderApp();
  showToast("已清空完成任务", "info");
}

export function markAllCompleted() {
  state.tasks = state.tasks.map(task => ({
    ...task,
    completed: true
  }));
  saveTasks();
  renderApp();
  showToast("所有任务已标记完成", "success");
}

export function markAllActive() {
  state.tasks = state.tasks.map(task => ({
    ...task,
    completed: false
  }));
  saveTasks();
  renderApp();
  showToast("所有任务已恢复为未完成", "info");
}

export function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  saveTheme();
  applyTheme();
  renderApp();
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
  showToast("JSON 已导出", "success");
}

export function importTasksFromJSON(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {
    try {
      const parsed = JSON.parse(event.target.result);

      if (!Array.isArray(parsed)) {
        showToast("导入失败：JSON 格式必须是数组", "error");
        return;
      }

      state.tasks = parsed.map(task => ({
        text: task.text || "",
        completed: !!task.completed,
        priority: task.priority || "medium",
        category: task.category || "study",
        dueDate: task.dueDate || "",
        createdAt: task.createdAt || new Date().toISOString(),
        starred: !!task.starred,
        tags: Array.isArray(task.tags) ? task.tags : []
      }));

      saveTasks();
      renderApp();
      showToast("导入成功", "success");
    } catch (error) {
      console.error(error);
      showToast("导入失败：文件不是合法 JSON", "error");
    }
  };

  reader.readAsText(file);
}