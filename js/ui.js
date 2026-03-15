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
  getCategoryStats,
  toggleTaskStarred
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
  const dueToday = getTodayDueCount();
  const overdue = getOverdueCount();

  totalEl.textContent = total;
  completedEl.textContent = completed;
  dueTodayEl.textContent = dueToday;
  overdueEl.textContent = overdue;

  dueTodayEl.style.color = dueToday > 0 ? "#f59e0b" : "";
  overdueEl.style.color = overdue > 0 ? "#ef4444" : "";
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

export function renderStarFilterButton() {
  const btn = document.getElementById("starFilterBtn");
  if (!btn) return;

  btn.dataset.active = state.showStarredOnly ? "true" : "false";
  btn.textContent = state.showStarredOnly ? "显示全部任务" : "只看收藏";
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
  const tagsHTML =
    task.tags && task.tags.length
      ? `
      <div class="task-tags">
        ${task.tags
          .map(tag => `<span class="task-tag">${escapeHTML(tag)}</span>`)
          .join("")}
      </div>
    `
      : "";

  return `
    <div class="task-left">
      <input type="checkbox" class="check-box" ${task.completed ? "checked" : ""}>
      <div class="task-main">
        <div class="task-top-row">
          <div class="task-title-wrap">
            <div class="task-text ${task.completed ? "completed" : ""}">
              ${escapeHTML(task.text)}
            </div>
            ${task.starred ? `<span class="star-mark">★</span>` : ""}
          </div>
          <button class="star-btn ${task.starred ? "active" : ""}" title="收藏任务">
            ${task.starred ? "★" : "☆"}
          </button>
        </div>
        ${createTaskMetaHTML(task)}
        ${tagsHTML}
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

  const hasSearch = state.searchKeyword.trim() !== "";
  const isFiltered =
    state.currentFilter !== "all" ||
    state.currentCategoryFilter !== "all" ||
    state.showStarredOnly;

  let title = "当前还没有任务";
  let description = "试试添加一个新的待办事项，开始整理你的计划吧。";

  if (hasSearch) {
    title = "没有搜索到匹配任务";
    description = "你可以换个关键词试试，或者清空搜索条件。";
  } else if (isFiltered) {
    title = "当前筛选条件下没有任务";
    description = "你可以切换筛选条件，看看其他分类、状态或收藏任务。";
  }

  taskList.innerHTML = `
    <li class="empty-tip">
      <strong>${title}</strong>
      <span>${description}</span>
    </li>
  `;
}

export function bindEditModeEvents(li, task, index) {
  const editInput = li.querySelector(".edit-input");
  const editPriority = li.querySelector(".edit-priority");
  const editCategory = li.querySelector(".edit-category");
  const editDate = li.querySelector(".edit-date");
  const editTags = li.querySelector(".edit-tags");
  const saveBtn = li.querySelector(".save-btn");
  const cancelBtn = li.querySelector(".cancel-btn");

  if (
    !editInput ||
    !editPriority ||
    !editCategory ||
    !editDate ||
    !saveBtn ||
    !cancelBtn
  ) {
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
      dueDate: editDate.value,
      tags: editTags
        ? editTags.value
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean)
        : task.tags || []
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
      <input type="text" class="edit-tags" value="${escapeHTML((task.tags || []).join(", "))}" placeholder="标签，用逗号分隔">
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
  const starBtn = li.querySelector(".star-btn");

  if (checkBox) {
    checkBox.addEventListener("change", () => {
      toggleTaskCompleted(index, checkBox.checked);
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      li.classList.add("removing");

      setTimeout(() => {
        deleteTask(index);
      }, 220);
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      renderEditMode(li, task, index);
    });
  }

  if (starBtn) {
    starBtn.addEventListener("click", () => {
      toggleTaskStarred(index);
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

    li.className = `task-item priority-${task.priority} ${task.starred ? "starred" : ""}`;
    li.innerHTML = createTaskItemHTML(task);

    bindTaskItemEvents(li, task, realIndex);
    taskList.appendChild(li);
  });
}

export function renderViewSwitch() {
  const listBtn = document.getElementById("listViewBtn");
  const boardBtn = document.getElementById("boardViewBtn");

  if (!listBtn || !boardBtn) return;

  listBtn.classList.toggle("active", state.currentView === "list");
  boardBtn.classList.toggle("active", state.currentView === "board");
}

export function renderTagFilter() {
  const tagFilterInput = document.getElementById("tagFilterInput");
  if (!tagFilterInput) return;

  tagFilterInput.value = state.currentTagFilter;
}

export function renderTaskBoard() {
  const board = document.getElementById("taskBoard");
  if (!board) return;

  const tasks = getProcessedTasks();

  const activeTasks = tasks.filter(task => !task.completed && !task.starred);
  const completedTasks = tasks.filter(task => task.completed);
  const starredTasks = tasks.filter(task => task.starred);

  const createBoardCards = list => {
    if (!list.length) {
      return `<div class="board-empty">暂无任务</div>`;
    }

    return list.map(task => {
      const tagsHTML = task.tags && task.tags.length
        ? `
          <div class="board-task-tags">
            ${task.tags
              .map(tag => `<span class="task-tag">${escapeHTML(tag)}</span>`)
              .join("")}
          </div>
        `
        : "";

      return `
        <div class="board-task-card priority-${task.priority}">
          <div class="board-task-title">
            ${escapeHTML(task.text)} ${task.starred ? "★" : ""}
          </div>
          <div class="board-task-meta">
            <span>${getPriorityText(task.priority)}</span>
            <span>${getCategoryText(task.category)}</span>
            <span>${task.dueDate || "无截止日期"}</span>
          </div>
          ${tagsHTML}
        </div>
      `;
    }).join("");
  };

  board.innerHTML = `
    <div class="board-column">
      <h3>未完成</h3>
      <div class="board-column-list">
        ${createBoardCards(activeTasks)}
      </div>
    </div>

    <div class="board-column">
      <h3>已完成</h3>
      <div class="board-column-list">
        ${createBoardCards(completedTasks)}
      </div>
    </div>

    <div class="board-column">
      <h3>收藏任务</h3>
      <div class="board-column-list">
        ${createBoardCards(starredTasks)}
      </div>
    </div>
  `;
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
  renderStarFilterButton();
  renderViewSwitch();
  renderTagFilter();

  const taskList = document.getElementById("taskList");
  const taskBoard = document.getElementById("taskBoard");

  if (state.currentView === "list") {
    if (taskList) taskList.classList.remove("hidden");
    if (taskBoard) taskBoard.classList.add("hidden");
    renderTaskList();
  } else {
    if (taskList) taskList.classList.add("hidden");
    if (taskBoard) taskBoard.classList.remove("hidden");
    renderTaskBoard();
  }
}