// js/main_app.js – ultra-small loader
import * as Core from './core/index.js';

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new Core.ProjectCuriosityApp({
      AppState:           Core.AppState,
      AuthManager:        Core.AuthManager,
      NavigationManager:  Core.NavigationManager,
      DashboardManager:   Core.DashboardManager
    });
    window.app.init();
  });
}