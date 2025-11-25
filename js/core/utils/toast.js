// toast.js - Queue System to prevent stacking toasts

class ToastQueue {
  constructor() {
    this.queue = [];
    this.isShowing = false;
    this.currentToast = null;
  }

  async show(message, type = 'info') {
    // Add to queue
    this.queue.push({ message, type });
    
    // Start processing if not already showing
    if (!this.isShowing) {
      await this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const { message, type } = this.queue.shift();
    
    const container = document.getElementById('toast-container');
    if (!container) {
      this.isShowing = false;
      this.queue = []; // Clear queue if container doesn't exist
      return;
    }

    // Remove any existing toast immediately
    if (this.currentToast && this.currentToast.parentNode) {
      this.currentToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.currentToast = toast;
    container.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Wait for toast to complete before showing next one
    await new Promise(resolve => {
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
          this.currentToast = null;
          resolve();
        }, 400); // Animation out duration
      }, 2500); // Show duration (2.5 seconds - faster)
    });
    
    // Small delay between toasts
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Process next toast in queue
    await this.processQueue();
  }

  // Clear all pending toasts
  clear() {
    this.queue = [];
    if (this.currentToast && this.currentToast.parentNode) {
      this.currentToast.classList.remove('show');
      setTimeout(() => {
        if (this.currentToast && this.currentToast.parentNode) {
          this.currentToast.remove();
        }
      }, 400);
    }
    this.isShowing = false;
  }
}

// Create singleton instance
const toastQueue = new ToastQueue();

// Export the showToast function
export function showToast(message, type = 'info') {
  toastQueue.show(message, type);
}

// Export clear function for emergency clearing
export function clearToasts() {
  toastQueue.clear();
}