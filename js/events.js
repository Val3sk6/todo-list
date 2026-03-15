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
import { closeConfirm, showConfirm } from "./feedback.js";

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
    markAllCompletedBtn.addEventListener("click", async () => {
      const ok = await showConfirm({
        title: "全部完成",
        message: "确定要将所有任务标记为已完成吗？"
      });
      if (ok) markAllCompleted();
    });
  }

  if (markAllActiveBtn) {
    markAllActiveBtn.addEventListener("click", async () => {
      const ok = await showConfirm({
        title: "全部取消完成",
        message: "确定要将所有任务设为未完成吗？"
      });
      if (ok) markAllActive();
    });
  }

  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", async () => {
      const ok = await showConfirm({
        title: "清空已完成",
        message: "此操作会删除所有已完成任务，确定继续吗？"
      });
      if (ok) clearCompletedTasks();
    });
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
    importInput.addEventListener("change", async event => {
      const file = event.target.files[0];
      if (!file) return;

      const ok = await showConfirm({
        title: "导入 JSON",
        message: "导入会用文件内容替换当前任务列表，确定继续吗？"
      });

      if (ok) {
        importTasksFromJSON(file);
      }

      importInput.value = "";
    });
  }
}

export function bindConfirmEvents() {
  const cancelBtn = document.getElementById("confirmCancelBtn");
  const okBtn = document.getElementById("confirmOkBtn");
  const modal = document.getElementById("confirmModal");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => closeConfirm(false));
  }

  if (okBtn) {
    okBtn.addEventListener("click", () => closeConfirm(true));
  }

  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeConfirm(false);
      }
    });
  }
}

export function bindStarFilterEvents() {
  const starFilterBtn = document.getElementById("starFilterBtn");
  if (!starFilterBtn) return;

  starFilterBtn.addEventListener("click", () => {
    state.showStarredOnly = !state.showStarredOnly;
    renderApp();
  });
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
  bindConfirmEvents();
  bindStarFilterEvents();
}