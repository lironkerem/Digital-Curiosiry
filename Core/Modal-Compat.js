// Modal-Compat.js – one-line wrappers that keep the old call-sites untouched
import * as modal from './Modal.js';

export const openSettings = () => modal.openSettings(window.app);
export const openAbout    = () => modal.openAbout(window.app);
export const openContact  = () => modal.openContact(window.app);
export const openBilling  = () => modal.openBilling(window.app);

export const saveQuickProfile    = () => modal.saveQuickProfile(window.app);
export const refreshAvatar       = () => modal.refreshAvatar(window.app);
export const avatarUploadHandler = () => modal.avatarUploadHandler(window.app);
export const selectPlan          = (_, planId) => modal.selectPlan(window.app, planId);
export const switchSettingTab    = modal.switchSettingTab; // needs no app