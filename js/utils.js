export function getPriorityText(priority) {
    const map = {
      high: "高优先级",
      medium: "中优先级",
      low: "低优先级"
    };
    return map[priority] || "中优先级";
  }
  
  export function getCategoryText(category) {
    const map = {
      study: "学习",
      life: "生活",
      sport: "运动",
      work: "工作"
    };
    return map[category] || "学习";
  }
  
  export function getPriorityValue(priority) {
    const map = {
      high: 3,
      medium: 2,
      low: 1
    };
    return map[priority] || 2;
  }
  
  export function formatDateTime(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "未知时间";
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
  
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
  
  export function getDueDiffDays(dueDate) {
    if (!dueDate) return null;
  
    const today = new Date();
    const target = new Date(dueDate);
  
    if (Number.isNaN(target.getTime())) return null;
  
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
  
    return (target - today) / (1000 * 60 * 60 * 24);
  }
  
  export function getDueStatus(dueDate) {
    const diffDays = getDueDiffDays(dueDate);
  
    if (diffDays === null) return "";
    if (diffDays < 0) return "已过期";
    if (diffDays === 0) return "今天到期";
    if (diffDays === 1) return "明天到期";
    return `还有 ${diffDays} 天`;
  }
  
  export function getDueClass(dueDate) {
    const diffDays = getDueDiffDays(dueDate);
  
    if (diffDays === null) return "";
    if (diffDays < 0) return "overdue";
    if (diffDays <= 1) return "due-soon";
    return "";
  }
  
  export function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }