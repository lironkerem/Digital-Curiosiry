// utils.js - Enhanced with input sanitization and better validation
const Utils = {
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
  
  sanitizeInput(str) {
    if (!str) return '';
    // Remove any potentially dangerous characters for PDF generation
    return String(str)
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .substring(0, 200); // Limit length
  },
  
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Cache for location searches to reduce API calls
  locationCache: new Map(),
  
  getCachedLocation(query) {
    const key = query.toLowerCase().trim();
    return this.locationCache.get(key);
  },
  
  setCachedLocation(query, results) {
    const key = query.toLowerCase().trim();
    // Limit cache size to 50 entries
    if (this.locationCache.size >= 50) {
      const firstKey = this.locationCache.keys().next().value;
      this.locationCache.delete(firstKey);
    }
    this.locationCache.set(key, results);
  }
};

// Input Validation Engine
const Validation = {
  validateName(value) {
    if (!value?.trim()) return { valid: false, message: 'Required' };
    if (value.length > 120) return { valid: false, message: 'Maximum 120 characters allowed' };
    if (!/^[A-Za-z\u00C0-\u017F' -]+$/.test(value.trim())) 
      return { valid: false, message: 'Only letters, spaces, hyphen, apostrophe allowed' };
    return { valid: true };
  },
  
  validateDateOfBirth(value) {
    if (!value) return { valid: false, message: 'Required' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) 
      return { valid: false, message: 'Please use YYYY-MM-DD' };
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return { valid: false, message: 'Invalid date' };
    if (date.getFullYear() < 1900) return { valid: false, message: 'Year must be 1900 or later' };
    if (date > new Date()) return { valid: false, message: 'Date cannot be in the future' };
    return { valid: true };
  },
  
  validateTimeOfBirth(value) {
    return !value || /^\d{2}:\d{2}$/.test(value) ? 
      { valid: true } : 
      { valid: false, message: 'Please use HH:MM format' };
  },
  
  validateLocation(value) {
    return !value?.trim() || value.length <= 200 ? 
      { valid: true } : 
      { valid: false, message: 'Maximum 200 characters allowed' };
  }
};

// Application State Management
class AppState {
  constructor() {
    this.analysisResults = null;
    this.narrativeResults = null;
    this.formData = {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      timeOfBirth: '',
      locationOfBirth: '',
      includeY: false
    };
  }
  
  updateFormData(field, value) {
    this.formData[field] = value;
  }
  
  setAnalysisResults(results) {
    this.analysisResults = results;
  }
  
  getAnalysisResults() {
    return this.analysisResults;
  }
}

// Toast Notification Manager
class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
  }
  
  show(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
    setTimeout(() => toast.remove(), 3400);
  }
}

// Progress Bar Manager
class ProgressManager {
  constructor() {
    this.wrapper = document.getElementById('progress-wrapper');
    this.inner = document.getElementById('progress-inner');
    this.text = document.getElementById('progress-text');
  }
  
  show() {
    this.wrapper.style.display = 'block';
    this.setProgress(0, 'Starting...');
  }
  
  hide() {
    this.wrapper.style.display = 'none';
  }
  
  setProgress(percentage, message = '') {
    this.inner.style.width = `${percentage}%`;
    this.inner.textContent = `${Math.round(percentage)}%`;
    if (message) this.text.textContent = message;
  }
  
  async animate(duration = 1000) {
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 8 + Math.random() * 7;
        if (progress >= 98) {
          progress = 98;
          clearInterval(interval);
        }
        this.setProgress(progress, 'Analyzing...');
      }, 40);
      setTimeout(() => {
        this.setProgress(100, 'Complete');
        setTimeout(() => {
          this.hide();
          resolve();
        }, 500);
      }, duration);
    });
  }
}

// Expose classes globally for use in other scripts
window.Utils = Utils;
window.Validation = Validation;
window.AppState = AppState;
window.ToastManager = ToastManager;
window.ProgressManager = ProgressManager;
export default Utils;
  