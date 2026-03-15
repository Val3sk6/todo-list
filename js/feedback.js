let confirmResolver = null;

export function showToast(message, type = "info", duration = 2200) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

export function showConfirm({
  title = "确认操作",
  message = "你确定要执行这个操作吗？"
} = {}) {
  const modal = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmTitle");
  const messageEl = document.getElementById("confirmMessage");

  if (!modal || !titleEl || !messageEl) {
    return Promise.resolve(false);
  }

  titleEl.textContent = title;
  messageEl.textContent = message;
  modal.classList.remove("hidden");

  return new Promise(resolve => {
    confirmResolver = resolve;
  });
}

export function closeConfirm(result) {
  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.classList.add("hidden");
  }

  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}