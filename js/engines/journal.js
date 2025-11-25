// ============================================
// JOURNAL ENGINE - WITH QUEST INTEGRATION
// ============================================
class JournalEngine {
  constructor(app) {
    this.app = app;
  }

  render() {
    const tab = document.getElementById('journal-tab');
    tab.innerHTML = `
      <div class="min-h-screen p-6" style="background: var(--neuro-bg);">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-4xl font-bold mb-4" style="color: var(--neuro-text);">Journal</h2>
          <p style="color: var(--neuro-text-light); font-size: 1.1rem;" class="mb-8">Your private space for reflection</p>
          
          <div class="card">
            <h3 style="color: var(--neuro-text); font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem;">📔 My Personal Journal</h3>
            
            <div class="space-y-4">
              <div>
                <label class="form-label">What happened today?</label>
                <textarea 
                  id="flip-journal-situation" 
                  class="form-input w-full min-h-[100px]"
                  placeholder="Describe the situation..."
                ></textarea>
              </div>

              <div>
                <label class="form-label">How did it make you feel?</label>
                <textarea 
                  id="flip-journal-feelings" 
                  class="form-input w-full min-h-[100px]"
                  placeholder="Express your emotions..."
                ></textarea>
              </div>

              <button id="flip-journal-btn" class="btn btn-primary w-full">
                Add New Journal Entry
              </button>
            </div>

            <!-- Journal Entries List -->
            <div class="mt-8">
              <h3 class="text-xl font-bold mb-4" style="color: var(--neuro-text);">Recent Entries</h3>
              <ul id="flip-journal-list" class="space-y-3"></ul>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.loadJournalEntries();
  }

  attachEventListeners() {
    const addBtn = document.getElementById('flip-journal-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.saveEntry());
    }
  }

  saveEntry() {
    const situationInput = document.getElementById('flip-journal-situation');
    const feelingsInput = document.getElementById('flip-journal-feelings');
    
    const situation = situationInput?.value.trim();
    const feelings = feelingsInput?.value.trim();

    // Validation
    if (!situation && !feelings) {
      this.app.showToast('⚠️ Please write something in your journal', 'warning');
      return;
    }

    // Create journal entry
    const entry = {
      situation: situation || '',
      feelings: feelings || '',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };

    // Save to app state
    this.app.state.addEntry('journal', entry);

    // ⭐ QUEST INTEGRATION: Trigger daily quest progress
    if (this.app.gamification) {
      this.app.gamification.progressQuest('daily', 'journal_entry', 1);
    }

    // Show success message
    this.app.showToast('✅ Journal entry saved!', 'success');

    // Clear inputs
    if (situationInput) situationInput.value = '';
    if (feelingsInput) feelingsInput.value = '';

    // Reload entries display
    this.loadJournalEntries();

    // Check for achievements
    this.checkAchievements();
  }

  loadJournalEntries() {
    const listContainer = document.getElementById('flip-journal-list');
    if (!listContainer) return;

    // Get all journal entries from state
    const entries = this.app.state.data.journalEntries || [];
    
    if (entries.length === 0) {
      listContainer.innerHTML = `
        <li class="text-center py-8" style="color: var(--neuro-text-light);">
          <p class="text-4xl mb-2">📝</p>
          <p>No journal entries yet. Start writing!</p>
        </li>
      `;
      return;
    }

    // Sort by most recent first
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Display entries (show latest 20)
    listContainer.innerHTML = sortedEntries.slice(0, 20).map((entry, index) => `
      <li class="card p-4" style="background: rgba(102, 126, 234, 0.05); border-left: 4px solid var(--neuro-accent);">
        <div class="flex justify-between items-start mb-2">
          <span class="text-sm font-semibold" style="color: var(--neuro-accent);">
            ${entry.date || new Date(entry.timestamp).toLocaleDateString()}
          </span>
          <div class="flex gap-2">
            <button onclick="window.featuresManager.engines.journal.editEntry(${entries.indexOf(entry)})" 
                    class="text-sm hover:text-blue-400" 
                    title="Edit">
              ✏️
            </button>
            <button onclick="window.featuresManager.engines.journal.deleteEntry(${entries.indexOf(entry)})" 
                    class="text-sm hover:text-red-400" 
                    title="Delete">
              🗑️
            </button>
          </div>
        </div>
        ${entry.situation ? `
          <div class="mb-2">
            <p class="text-xs font-semibold mb-1" style="color: var(--neuro-text-light);">Situation:</p>
            <p style="color: var(--neuro-text);">${this.escapeHtml(entry.situation)}</p>
          </div>
        ` : ''}
        ${entry.feelings ? `
          <div>
            <p class="text-xs font-semibold mb-1" style="color: var(--neuro-text-light);">Feelings:</p>
            <p style="color: var(--neuro-text);">${this.escapeHtml(entry.feelings)}</p>
          </div>
        ` : ''}
      </li>
    `).join('');

    if (entries.length > 20) {
      listContainer.innerHTML += `
        <li class="text-center py-4" style="color: var(--neuro-text-light);">
          <p class="text-sm">Showing 20 most recent entries (${entries.length} total)</p>
        </li>
      `;
    }
  }

  editEntry(index) {
    const entries = this.app.state.data.journalEntries || [];
    const entry = entries[index];
    
    if (!entry) return;

    const situationInput = document.getElementById('flip-journal-situation');
    const feelingsInput = document.getElementById('flip-journal-feelings');

    if (situationInput) situationInput.value = entry.situation || '';
    if (feelingsInput) feelingsInput.value = entry.feelings || '';

    // Delete the old entry
    this.deleteEntry(index, true);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    this.app.showToast('✏️ Edit your entry and save', 'info');
  }

  deleteEntry(index, silent = false) {
    if (!silent && !confirm('Delete this journal entry?')) return;

    const entries = this.app.state.data.journalEntries || [];
    entries.splice(index, 1);
    
    this.app.state.data.journalEntries = entries;
    this.app.state.saveAppData();
    
    if (!silent) {
      this.app.showToast('🗑️ Journal entry deleted', 'info');
    }
    
    this.loadJournalEntries();
  }

  checkAchievements() {
    const total = this.app.state.data.journalEntries?.length || 0;
    const gm = this.app.gamification;

    if (!gm) return;

    // First journal entry
    if (total === 1) {
      gm.grantAchievement({ 
        id: 'first_journal', 
        name: 'First Reflection', 
        xp: 50, 
        icon: '📔', 
        inspirational: 'You\'ve begun your journey of self-reflection!' 
      });
    }

    // 10 journal entries
    if (total === 10) {
      gm.grantAchievement({ 
        id: 'journal_10', 
        name: 'Reflective Writer', 
        xp: 100, 
        icon: '✍️', 
        inspirational: '10 journal entries! Your self-awareness is growing!' 
      });
    }

    // 50 journal entries
    if (total === 50) {
      gm.grantAchievement({ 
        id: 'journal_50', 
        name: 'Master Journaler', 
        xp: 250, 
        icon: '📖', 
        inspirational: '50 entries! You are a master of introspection!' 
      });
    }

    // 100 journal entries
    if (total === 100) {
      gm.grantAchievement({ 
        id: 'journal_100', 
        name: 'Chronicle Keeper', 
        xp: 500, 
        icon: '📚', 
        inspirational: '100 journal entries! Your wisdom is documented!' 
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default JournalEngine;