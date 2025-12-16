// WellnessAutomationManager.js

class WellnessAutomationManager {
  constructor(app) {
    this.app = app;
    this.timers = {};
    this.lastTriggered = {};
    this.init();
  }

  init() {
    // Load saved automations and start timers
    this.startAutomations();
    
    // Expose restart method globally
    window.app.restartAutomations = () => this.restartAutomations();
  }

  startAutomations() {
    const automations = this.loadAutomations();
    
    const toolMap = {
      selfReset: { name: 'Self Reset', open: () => window.openSelfReset?.() },
      fullBodyScan: { name: 'Full Body Scan', open: () => window.openFullBodyScan?.() },
      nervousSystem: { name: 'Nervous System Reset', open: () => window.openNervousReset?.() },
      tensionSweep: { name: 'Tension Sweep', open: () => window.openTensionSweep?.() }
    };

    Object.keys(automations).forEach(toolKey => {
      const config = automations[toolKey];
      const tool = toolMap[toolKey];
      
      if (config.enabled && tool && tool.open) {
        this.scheduleAutomation(toolKey, tool, config.interval);
      }
    });
  }

  scheduleAutomation(toolKey, tool, intervalMinutes) {
    // Clear existing timer if any
    if (this.timers[toolKey]) {
      clearInterval(this.timers[toolKey]);
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Set up recurring timer
    this.timers[toolKey] = setInterval(() => {
      this.triggerTool(toolKey, tool);
    }, intervalMs);

    console.log(`⚙️ Automation scheduled: ${tool.name} every ${intervalMinutes} minutes`);
  }

  triggerTool(toolKey, tool) {
    const now = Date.now();
    const lastTime = this.lastTriggered[toolKey] || 0;
    
    // Prevent triggering too frequently (safety check)
    if (now - lastTime < 30000) return; // Min 30 seconds between triggers
    
    this.lastTriggered[toolKey] = now;
    
    // Show notification
    this.showAutomationNotification(tool.name, () => {
      if (tool.open) tool.open();
    });
  }

  showAutomationNotification(toolName, onOpen) {
    // Create notification overlay
    const notification = document.createElement('div');
    notification.className = 'automation-notification';
    notification.innerHTML = `
      <div class="automation-notification-content">
        <div class="automation-notification-icon">🔔</div>
        <div class="automation-notification-text">
          <strong>Time for ${toolName}</strong>
          <p>Ready for your wellness practice?</p>
        </div>
        <div class="automation-notification-actions">
          <button class="automation-btn-start">Start Now</button>
          <button class="automation-btn-dismiss">Dismiss</button>
        </div>
      </div>
    `;

    // Add styles if not already present
    if (!document.getElementById('automation-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'automation-notification-styles';
      style.textContent = `
        .automation-notification {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 999999;
          animation: slideInRight 0.3s ease;
        }
        
        .automation-notification-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 320px;
          color: white;
        }
        
        .automation-notification-icon {
          font-size: 2rem;
          animation: bell-ring 0.5s ease;
        }
        
        .automation-notification-text strong {
          display: block;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        
        .automation-notification-text p {
          font-size: 0.85rem;
          opacity: 0.9;
          margin: 0;
        }
        
        .automation-notification-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-left: auto;
        }
        
        .automation-btn-start,
        .automation-btn-dismiss {
          padding: 6px 12px;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .automation-btn-start {
          background: white;
          color: #667eea;
        }
        
        .automation-btn-start:hover {
          background: #f0f0f0;
          transform: scale(1.05);
        }
        
        .automation-btn-dismiss {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .automation-btn-dismiss:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-10deg); }
          20%, 40% { transform: rotate(10deg); }
          50% { transform: rotate(0deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Event handlers
    notification.querySelector('.automation-btn-start').addEventListener('click', () => {
      onOpen();
      notification.remove();
    });

    notification.querySelector('.automation-btn-dismiss').addEventListener('click', () => {
      notification.remove();
    });

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 30000);
  }

  loadAutomations() {
    try {
      return JSON.parse(localStorage.getItem('wellness_automations')) || {
        selfReset: { enabled: false, interval: 60 },
        fullBodyScan: { enabled: false, interval: 180 },
        nervousSystem: { enabled: false, interval: 120 },
        tensionSweep: { enabled: false, interval: 120 }
      };
    } catch {
      return {
        selfReset: { enabled: false, interval: 60 },
        fullBodyScan: { enabled: false, interval: 180 },
        nervousSystem: { enabled: false, interval: 120 },
        tensionSweep: { enabled: false, interval: 120 }
      };
    }
  }

  restartAutomations() {
    // Clear all existing timers
    Object.keys(this.timers).forEach(key => {
      clearInterval(this.timers[key]);
    });
    this.timers = {};
    this.lastTriggered = {};
    
    // Restart with new settings
    this.startAutomations();
    
    console.log('⚙️ Automations restarted with new settings');
  }

  destroy() {
    // Clean up all timers
    Object.keys(this.timers).forEach(key => {
      clearInterval(this.timers[key]);
    });
    this.timers = {};
    this.lastTriggered = {};
  }
}

// Initialize when app is ready
// Add this to your main app initialization:
window.addEventListener('DOMContentLoaded', () => {
  if (window.app) {
    window.app.wellnessAutomation = new WellnessAutomationManager(window.app);
  }
});

export default WellnessAutomationManager;