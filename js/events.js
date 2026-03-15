import { state } from "./state.js";
import {
  addTask,
  clearCompletedTasks,
  markAllCompleted,
  markAllActive,
  toggleTheme,
  exportTasksAsJSON,
  importTasksFromJSON
} from "./taskService.js";
import { renderApp } from "./ui.js";

export function bindFilterEvents() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      state.currentFilter = button.dataset.filter;
      renderApp();
    });
  });
}

export function bindCategoryFilterEvents() {
  const categoryFilterSelect = document.getElementById("categoryFilterSelect");

  if (!categoryFilterSelect) return;

  categoryFilterSelect.addEventListener("change", () => {
    state.currentCategoryFilter = categoryFilterSelect.value;
    renderApp();
  });
}

export function bindSearchEvents() {
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", () => {
    state.searchKeyword = searchInput.value.trim();
    renderApp();
  });
}

export function bindSortEvents() {
  const sortSelect = document.getElementById("sortSelect");

  sortSelect.addEventListener("change", () => {
    state.currentSort = sortSelect.value;
    renderApp();
  });
}

export function bindAddEvents() {
  const addBtn = document.getElementById("addBtn");
  const taskInput = document.getElementById("taskInput");

  addBtn.addEventListener("click", addTask);

  taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      addTask();
    }
  });
}

export function bindBatchEvents() {
  const markAllCompletedBtn = document.getElementById("markAllCompletedBtn");
  const markAllActiveBtn = document.getElementById("markAllActiveBtn");
  const clearCompletedBtn = document.getElementById("clearCompletedBtn");

  if (markAllCompletedBtn) {
    markAllCompletedBtn.addEventListener("click", markAllCompleted);
  }

  if (markAllActiveBtn) {
    markAllActiveBtn.addEventListener("click", markAllActive);
  }

  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", clearCompletedTasks);
  }
}

export function bindThemeEvents() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (!themeToggleBtn) return;

  themeToggleBtn.addEventListener("click", toggleTheme);
}

export function bindFileEvents() {
  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importInput");

  if (exportBtn) {
    exportBtn.addEventListener("click", exportTasksAsJSON);
  }

  if (importInput) {
    importInput.addEventListener("change", event => {
      const file = event.target.files[0];
      importTasksFromJSON(file);
      importInput.value = "";
    });
  }
}

export function bindAllEvents() {
  bindFilterEvents();
  bindCategoryFilterEvents();
  bindSearchEvents();
  bindSortEvents();
  bindAddEvents();
  bindBatchEvents();
  bindThemeEvents();
  bindFileEvents();
}