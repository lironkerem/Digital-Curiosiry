// Core/Index.js – barrel file (re-exports everything)
export {default as AppState}          from './AppState.js';
export {default as AuthManager}       from './AuthManager.js';
export {default as NavigationManager} from './NavigationManager.js';
export {default as DashboardManager}  from './DashboardManager.js';
export {default as ProjectCuriosityApp}from './ProjectCuriosityApp.js';
export * from './Toast.js';
export * from './Modal-Compat.js';   // or Modal.js if you skipped compat