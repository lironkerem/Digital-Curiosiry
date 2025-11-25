// js/core/index.js  –  barrel file (re-exports everything)
export { default as AppState }           from './AppState.js';
export { default as AuthManager }        from './AuthManager.js';
export { default as NavigationManager }  from './NavigationManager.js';
export { default as DashboardManager }   from './DashboardManager.js';
export { default as ProjectCuriosityApp }from './ProjectCuriosityApp.js';

export * from './utils/toast.js';
export * from './utils/modal-compat.js';   // or modal.js if you skipped compat