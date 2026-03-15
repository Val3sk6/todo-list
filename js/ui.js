import { state } from "./state.js";
import {
  getPriorityText,
  getCategoryText,
  formatDateTime,
  getDueStatus,
  getDueClass,
  escapeHTML
} from "./utils.js";
import {
  getTaskStats,
  getProcessedTasks,
  deleteTask,
  toggleTaskCompleted,
  updateTask,
  getCompletionRate,
  getTodayDueCount,
  getOverdueCount,
  getCategoryStats
} from "./taskService.js";
import { showToast } from "./feedback.js";

export function applyTheme() {
  document.body.classList.toggle("dark-mode", state.theme === "dark");
}

export function renderStats() {
  const statsElement = document.getElementById("stats");
  if (!statsElement) return;

  const { total, completed, active } = getTaskStats();
  statsElement.textContent = `总计：${total} ｜ 已完成：${completed} ｜ 未完成：${active}`;
}

export function renderDashboardCards() {
  const totalEl = document.getElementById("statTotal");
  const completedEl = document.getElementById("statCompleted");
  const dueTodayEl = document.getElementById("statDueToday");
  const overdueEl = document.getElementById("statOverdue");

  if (!totalEl || !completedEl || !dueTodayEl || !overdueEl) return;

  const { total, completed } = getTaskStats();

  totalEl.textContent = total;
  completedEl.textContent = completed;
  dueTodayEl.textContent = getTodayDueCount();
  overdueEl.textContent = getOverdueCount();
}

export function renderCompletionRate() {
  const textEl = document.getElementById("completionRateText");
  const barEl = document.getElementById("completionRateBar");

  if (!textEl || !barEl) return;

  const rate = getCompletionRate();
  textEl.textContent = `${rate}%`;
  barEl.style.width = `${rate}%`;
}

export function renderCategoryStats() {
  const container = document.getElementById("categoryStatsGrid");
  if (!container) return;

  const stats = getCategoryStats();

  container.innerHTML = `
    <div class="category-stat-card category-stat-study">
      <h4>学习</h4>
      <p>${stats.study}</p>
    </div>
    <div class="category-stat-card category-stat-life">
      <h4>生活</h4>
      <p>${stats.life}</p>
    </div>
    <div class="category-stat-card category-stat-sport">
      <h4>运动</h4>
      <p>${stats.sport}</p>
    </div>
    <div class="category-stat-card category-stat-work">
      <h4>工作</h4>
      <p>${stats.work}</p>
    </div>
  `;
}

export function renderFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === state.currentFilter;
    button.classList.toggle("active", isActive);
  });
}

export function renderCategoryFilter() {
  const categoryFilterSelect = document.getElementById("categoryFilterSelect");
  if (!categoryFilterSelect) return;

  categoryFilterSelect.value = state.currentCategoryFilter;
}

export function renderSortSelect() {
  const sortSelect = document.getElementById("sortSelect");
  if (!sortSelect) return;

  sortSelect.value = state.currentSort;
}

export function renderThemeButton() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (!themeToggleBtn) return;

  themeToggleBtn.textContent =
    state.theme === "dark" ? "切换浅色模式" : "切换深色模式";
}

export function createTaskMetaHTML(task) {
  const priorityClass = `priority-${task.priority}-badge`;
  const categoryClass = `category-${task.category}`;
  const dueStatus = getDueStatus(task.dueDate);
  const dueClass = getDueClass(task.dueDate);

  return `
    <div class="task-meta">
      <span class="priority-badge ${priorityClass}">
        ${getPriorityText(task.priority)}
      </span>
      <span class="category-badge ${categoryClass}">
        ${getCategoryText(task.category)}
      </span>
      <span>截止日期：${task.dueDate || "未设置"}</span>
      <span class="${dueClass}">${dueStatus}</span>
      <span>创建时间：${formatDateTime(task.createdAt)}</span>
    </div>
  `;
}

export function createTaskItemHTML(task) {
  return `
    <div class="task-left">
      <input type="checkbox" class="check-box" ${task.completed ? "checked" : ""}>
      <div class="task-main">
        <div class="task-text ${task.completed ? "completed" : ""}">
          ${escapeHTML(task.text)}
        </div>
        ${createTaskMetaHTML(task)}
      </div>
    </div>
    <div class="task-actions">
      <button class="edit-btn">编辑</button>
      <button class="delete-btn">删除</button>
    </div>
  `;
}

export function renderEmptyState() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  taskList.innerHTML = `<li class="empty-tip">暂无符合条件的任务</li>`;
}

export function bindEditModeEvents(li, task, index) {
  const editInput = li.querySelector(".edit-input");
  const editPriority = li.querySelector(".edit-priority");
  const editCategory = li.querySelector(".edit-category");
  const editDate = li.querySelector(".edit-date");
  const saveBtn = li.querySelector(".save-btn");
  const cancelBtn = li.querySelector(".cancel-btn");

  if (!editInput || !editPriority || !editCategory || !editDate || !saveBtn || !cancelBtn) {
    return;
  }

  editInput.focus();

  const handleSave = () => {
    const newText = editInput.value.trim();

    if (newText === "") {
      showToast("任务内容不能为空！", "error");
      return;
    }

    updateTask(index, {
      text: newText,
      priority: editPriority.value,
      category: editCategory.value,
      dueDate: editDate.value
    });
  };

  saveBtn.addEventListener("click", handleSave);

  cancelBtn.addEventListener("click", () => {
    renderApp();
  });

  editInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      handleSave();
    }
  });
}

export function renderEditMode(li, task, index) {
  li.innerHTML = `
    <div class="edit-panel">
      <input type="text" class="edit-input" value="${escapeHTML(task.text)}">
      <select class="edit-priority">
        <option value="high" ${task.priority === "high" ? "selected" : ""}>高优先级</option>
        <option value="medium" ${task.priority === "medium" ? "selected" : ""}>中优先级</option>
        <option value="low" ${task.priority === "low" ? "selected" : ""}>低优先级</option>
      </select>
      <select class="edit-category">
        <option value="study" ${task.category === "study" ? "selected" : ""}>学习</option>
        <option value="life" ${task.category === "life" ? "selected" : ""}>生活</option>
        <option value="sport" ${task.category === "sport" ? "selected" : ""}>运动</option>
        <option value="work" ${task.category === "work" ? "selected" : ""}>工作</option>
      </select>
      <input type="date" class="edit-date" value="${task.dueDate || ""}">
      <button class="save-btn">保存</button>
      <button class="cancel-btn">取消</button>
    </div>
  `;

  bindEditModeEvents(li, task, index);
}

export function bindTaskItemEvents(li, task, index) {
  const checkBox = li.querySelector(".check-box");
  const editBtn = li.querySelector(".edit-btn");
  const deleteBtn = li.querySelector(".delete-btn");

  if (checkBox) {
    checkBox.addEventListener("change", () => {
      toggleTaskCompleted(index, checkBox.checked);
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      deleteTask(index);
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      renderEditMode(li, task, index);
    });
  }
}

export function renderTaskList() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  taskList.innerHTML = "";

  const processedTasks = getProcessedTasks();

  if (processedTasks.length === 0) {
    renderEmptyState();
    return;
  }

  processedTasks.forEach(task => {
    const realIndex = state.tasks.indexOf(task);
    const li = document.createElement("li");

    li.className = `task-item priority-${task.priority}`;
    li.innerHTML = createTaskItemHTML(task);

    bindTaskItemEvents(li, task, realIndex);
    taskList.appendChild(li);
  });
}

export function renderApp() {
  applyTheme();
  renderThemeButton();
  renderStats();
  renderDashboardCards();
  renderCompletionRate();
  renderCategoryStats();
  renderFilterButtons();
  renderCategoryFilter();
  renderSortSelect();
  renderTaskList();
}