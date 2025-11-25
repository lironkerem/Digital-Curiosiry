// ============================================
// AUTHENTICATION MANAGER
// ============================================
export default class AuthManager {
  constructor(app) {
    this.app = app;
  }

  checkAuth() {
    const userData = localStorage.getItem('pc_user');
    if (userData) {
      try {
        this.app.state.currentUser = JSON.parse(userData);
        this.app.state.isAuthenticated = true;
        return true;
      } catch (e) {
        console.error('Failed to parse user data');
        localStorage.removeItem('pc_user');
      }
    }
    return false;
  }

  renderAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    authScreen.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="auth-card">
<div class="text-center mb-8">
  <div class="logo-icon mx-auto mb-4" style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
    <img src="https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/Watermarks/Logo.svg"
         alt="Aanandoham Logo"
         style="width:32px;height:32px;object-fit:contain;">
  </div>
  <h1 class="text-3xl font-bold mb-2">Project Curiosity</h1>
  <p style="color: #6c757d">by Aanandoham</p>
</div>
          <div class="flex gap-2 mb-6">
            <button onclick="window.app.auth.showTab('login')" 
                    class="auth-tab active" 
                    data-tab="login">
              Sign In
            </button>
            <button onclick="window.app.auth.showTab('signup')" 
                    class="auth-tab" 
                    data-tab="signup">
              Sign Up
            </button>
          </div>

          <form id="login-form" onsubmit="window.app.auth.handleLogin(event)" class="space-y-4">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" placeholder="your@email.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary w-full">
              Enter Your Spiritual Journey
            </button>
          </form>

          <form id="signup-form" onsubmit="window.app.auth.handleSignup(event)" class="space-y-4 hidden">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-input" placeholder="Your spiritual name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" placeholder="your@email.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" placeholder="••••••••" minlength="6" required />
            </div>
            <button type="submit" class="btn btn-primary w-full">
              Begin Your Journey
            </button>
          </form>
          
          <p class="text-center mt-6 text-sm" style="color: #6c757d">
            Demo Version - Use any email/password to enter
          </p>
        </div>
      </div>
    `;
  }

  showTab(tabName) {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active', 'bg-primary-600', 'text-white');
        tab.classList.remove('bg-white/10', 'text-purple-200');
      } else {
        tab.classList.remove('active', 'bg-primary-600', 'text-white');
        tab.classList.add('bg-white/10', 'text-purple-200');
      }
    });

    if (tabName === 'login') {
      document.getElementById('login-form').classList.remove('hidden');
      document.getElementById('signup-form').classList.add('hidden');
    } else {
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('signup-form').classList.remove('hidden');
    }
  }

  handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    const user = {
      id: Date.now(),
      name: email.split('@')[0],
      email: email,
      tier: 'Premium',
      joinDate: new Date().toISOString(),
      avatar: '👤'
    };
    
    this.completeAuth(user);
  }

  handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    
    const user = {
      id: Date.now(),
      name: name,
      email: email,
      tier: 'Premium',
      joinDate: new Date().toISOString(),
      avatar: '👤'
    };
    
    this.completeAuth(user);
  }

  completeAuth(user) {
    this.app.state.currentUser = user;
    this.app.state.isAuthenticated = true;
    localStorage.setItem('pc_user', JSON.stringify(user));
    
    const authScreen = document.getElementById('auth-screen');
    if (authScreen) {
      authScreen.style.display = 'none';
      authScreen.innerHTML = '';
    }
    
    this.app.initializeApp();
  }
}
