import { loadTasks, loadTheme } from "./storage.js";
import { bindAllEvents } from "./events.js";
import { renderApp } from "./ui.js";

function init() {
  loadTasks();
  loadTheme();
  bindAllEvents();
  renderApp();
}

init();