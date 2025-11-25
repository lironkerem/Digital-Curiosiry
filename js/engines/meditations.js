// ============================================
// MEDITATIONS ENGINE - WITH QUEST INTEGRATION
// ============================================
class MeditationsEngine {
  constructor(app) {
    this.app = app;
    this.currentAudio = null;
    this.isPlaying = false;
    this.currentMeditation = null;
    this.sessionStartTime = null; // Track when meditation starts
    
    // PDF Guide URL
    this.pdfGuideUrl = 'YOUR_PDF_URL_HERE'; // Replace with actual PDF URL
    
    // Meditation library with direct audio links from a public repository to avoid CORS issues
    this.meditations = [
      {
        id: 1,
        title: 'Grounding to the Center of Earth',
        duration: '18:30',
        category: 'Grounding',
        description: 'Connect deeply with Earth energy and find your center',
        audioUrl: 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/meditations/GroundingToTheCenterOfEarth.mp3',
        emoji: '🌍',
        type: 'guided' // Mark as guided for quest tracking
      },
      {
        id: 2,
        title: 'Aura Adjustment and Cleaning',
        duration: '22:15',
        category: 'Energy',
        description: 'Cleanse and strengthen your energetic field',
        audioUrl: 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/meditations/AuraAdjustmentAndCleaning.mp3',
        emoji: '✨',
        type: 'guided'
      },
      {
        id: 3,
        title: 'Chakra Cleaning',
        duration: '25:40',
        category: 'Chakras',
        description: 'Balance and clear all seven energy centers',
        audioUrl: 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/meditations/ChakraCleaning.mp3',
        emoji: '🌈',
        type: 'guided'
      },
      {
        id: 4,
        title: 'The Center of the Universe',
        duration: '20:10',
        category: 'Spiritual',
        description: 'Expand your consciousness to cosmic awareness',
        audioUrl: 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/meditations/TheCenterOfTheUniverse.mp3',
        emoji: '🌌',
        type: 'guided'
      },
      {
        id: 5,
        title: 'Blowing Roses Healing Technique',
        duration: '18:45',
        category: 'Healing',
        description: 'Release emotional blockages with visualization',
        audioUrl: 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/meditations/BlowingRosesHealingTechnique.mp3',
        emoji: '🌹',
        type: 'guided'
      },
      {
        id: 6,
        title: '3 Wishes Manifestation',
        duration: '22:30',
        category: 'Manifestation',
        description: 'Align your intentions with universal flow',
        audioUrl: 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/meditations/3WishesManifestation.mp3',
        emoji: '⭐',
        type: 'guided'
      }
    ];
  }

  render() {
    const tab = document.getElementById('meditations-tab');
    
    tab.innerHTML = `
      <div class="min-h-screen p-6" style="background: var(--neuro-bg);">
        <div class="max-w-6xl mx-auto">
          
          <!-- Header -->
          <div class="text-center mb-8">
            <h2 class="text-4xl font-bold mb-4" style="color: var(--neuro-text);">Guided Meditations</h2>
            <p style="color: var(--neuro-text-light); font-size: 1.1rem;">Deep journeys for inner transformation</p>
          </div>

          <!-- PDF Guide Button -->
          <div class="text-center mb-8">
            <button onclick="window.featuresManager.engines.meditations.openPDFGuide()" 
                    class="btn btn-primary" 
                    style="padding: 12px 32px; display: inline-flex; align-items: center; gap: 8px;">
              📖 Meditation Guide (PDF)
            </button>
          </div>

          <!-- Meditation Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${this.meditations.map(med => `
              <div class="card cursor-pointer" 
                   onclick="window.featuresManager.engines.meditations.playMeditation(${med.id})">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-3xl">${med.emoji}</span>
                  <span class="text-sm" style="color: var(--neuro-text-light);">${med.duration}</span>
                </div>
                <h4 class="text-xl font-bold mb-2" style="color: var(--neuro-text);">${med.title}</h4>
                <p style="color: var(--neuro-text-light);" class="text-sm mb-3">${med.description}</p>
                <span class="badge badge-primary">${med.category}</span>
              </div>
            `).join('')}
          </div>

          <!-- Compact Audio Player -->
          <div id="meditation-audio-player" class="compact-player hidden">
            <button onclick="window.featuresManager.engines.meditations.stopMeditation()" class="player-close-btn">✕</button>
            
            <div class="player-info">
                <div id="player-emoji" class="player-emoji">🎧</div>
                <div class="player-text">
                    <h4 id="player-title" class="font-bold">No Meditation Selected</h4>
                    <p id="player-time" class="text-sm">0:00 / 0:00</p>
                </div>
            </div>

            <div class="player-controls">
                <button onclick="window.featuresManager.engines.meditations.skipBackward()" class="icon-btn">⏪</button>
                
                <div class="play-pause-wrapper">
                    <svg class="progress-ring" width="60" height="60">
                        <circle class="progress-ring-bg" stroke-width="4" fill="transparent" r="28" cx="30" cy="30" />
                        <circle id="player-progress-ring" class="progress-ring-fg" stroke-width="4" fill="transparent" r="28" cx="30" cy="30" />
                    </svg>
                    <button onclick="window.featuresManager.engines.meditations.togglePlay()" id="play-pause-btn" class="btn btn-primary play-pause-btn">▶️</button>
                </div>

                <button onclick="window.featuresManager.engines.meditations.skipForward()" class="icon-btn">⏩</button>
            </div>
            <audio id="meditation-audio" preload="metadata" crossOrigin="anonymous"></audio>
          </div>

        </div>
      </div>
      
      <style>
        .compact-player {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 90%;
            max-width: 380px;
            background: var(--neuro-bg);
            border-radius: var(--radius-2xl);
            padding: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 16px;
            box-shadow: 20px 20px 40px var(--neuro-shadow-dark), -20px -20px 40px var(--neuro-shadow-light);
            transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .compact-player.hidden {
            transform: translateY(100px);
            opacity: 0;
            pointer-events: none;
        }
        
        .player-close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 30px;
            height: 30px;
            border: none;
            background: none;
            cursor: pointer;
            color: var(--neuro-text-light);
            font-size: 1.2rem;
            line-height: 1;
        }

        .player-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .player-emoji {
            width: 50px;
            height: 50px;
            flex-shrink: 0;
            background: var(--neuro-bg);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            box-shadow: inset 4px 4px 8px var(--neuro-shadow-dark), inset -4px -4px 8px var(--neuro-shadow-light);
        }
        
        .player-text #player-title {
            color: var(--neuro-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .player-text #player-time {
            color: var(--neuro-text-light);
        }

        .player-controls {
            display: flex;
            justify-content: space-around;
            align-items: center;
        }
        
        .play-pause-wrapper {
            position: relative;
            width: 60px;
            height: 60px;
        }

        .play-pause-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 0;
        }
        
        .progress-ring {
            position: absolute;
            top: 0;
            left: 0;
        }

        .progress-ring-bg {
            stroke: var(--neuro-shadow-dark);
        }

        .progress-ring-fg {
            stroke: var(--neuro-accent);
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
            transition: stroke-dashoffset 0.1s linear;
        }

        .player-controls .icon-btn {
            width: 40px;
            height: 40px;
            padding: 0;
        }
      </style>
    `;
  }

  playMeditation(id) {
    const meditation = this.meditations.find(m => m.id === id);
    if (!meditation) return;
    
    this.currentMeditation = meditation;
    this.sessionStartTime = Date.now(); // Track session start
    
    const audio = document.getElementById('meditation-audio');
    const player = document.getElementById('meditation-audio-player');
    
    if (this.currentAudio && this.currentAudio.src === meditation.audioUrl) {
      this.togglePlay();
      return;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    
    audio.src = meditation.audioUrl;
    this.currentAudio = audio;
    
    // Update UI
    document.getElementById('player-emoji').textContent = meditation.emoji;
    document.getElementById('player-title').textContent = meditation.title;
    player.classList.remove('hidden');
    
    audio.load();
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          document.getElementById('play-pause-btn').textContent = '⏸️';
          this.app.showToast(`🎧 Playing: ${meditation.title}`, 'success');
        })
        .catch(err => {
          console.error('Playback error:', err);
          this.isPlaying = false;
          document.getElementById('play-pause-btn').textContent = '▶️';
          this.app.showToast('⚠️ Unable to play audio. Click play to start.', 'warning');
        });
    }
    
    const onLoadedMetadata = () => this.updateProgress();
    const onTimeUpdate = () => this.updateProgress();
    const onEnded = () => this.onMeditationComplete();

    audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    audio.removeEventListener('timeupdate', onTimeUpdate);
    audio.removeEventListener('ended', onEnded);
    
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
  }

  togglePlay() {
    if (!this.currentAudio) return;
    
    if (this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
      document.getElementById('play-pause-btn').textContent = '▶️';
    } else {
      this.currentAudio.play();
      this.isPlaying = true;
      document.getElementById('play-pause-btn').textContent = '⏸️';
    }
  }

  stopMeditation() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
      this.currentMeditation = null;
      this.sessionStartTime = null;
      document.getElementById('play-pause-btn').textContent = '▶️';
      document.getElementById('meditation-audio-player').classList.add('hidden');
    }
  }

  skipForward() {
    if (this.currentAudio) {
      this.currentAudio.currentTime = Math.min(
        this.currentAudio.currentTime + 15,
        this.currentAudio.duration
      );
    }
  }

  skipBackward() {
    if (this.currentAudio) {
      this.currentAudio.currentTime = Math.max(this.currentAudio.currentTime - 15, 0);
    }
  }

  updateProgress() {
    if (!this.currentAudio || !this.currentAudio.duration) return;

    // Update time display
    const currentTimeEl = document.getElementById('player-time');
    if (currentTimeEl) {
        const currentTime = this.formatTime(this.currentAudio.currentTime);
        const totalTime = this.formatTime(this.currentAudio.duration);
        currentTimeEl.textContent = `${currentTime} / ${totalTime}`;
    }

    // Update circular progress bar
    const progressRing = document.getElementById('player-progress-ring');
    if (progressRing) {
        const radius = progressRing.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        
        const progress = this.currentAudio.currentTime / this.currentAudio.duration;
        const offset = circumference - progress * circumference;
        progressRing.style.strokeDashoffset = isNaN(offset) ? circumference : offset;
    }
  }

  // ============================================
  // MEDITATION COMPLETION - WITH QUEST INTEGRATION
  // ============================================
  onMeditationComplete() {
    this.isPlaying = false;
    document.getElementById('play-pause-btn').textContent = '▶️';
    this.app.showToast('🎉 Meditation complete! Well done.', 'success');
    
    if (!this.currentMeditation || !this.currentAudio) return;

    const duration = Math.floor(this.currentAudio.duration / 60); // minutes
    const chakra = this.getChakraFromMeditation(this.currentMeditation.category);
    
    // Create session data
    const sessionData = {
      type: this.currentMeditation.type || 'guided',
      meditationId: this.currentMeditation.id,
      title: this.currentMeditation.title,
      category: this.currentMeditation.category,
      duration: duration,
      chakra: chakra,
      timestamp: new Date().toISOString(),
      sessionStartTime: this.sessionStartTime,
      completedAt: Date.now()
    };
    
    // Save to app state
    if (this.app.state) {
      this.app.state.addEntry('meditation', sessionData);
    }

    // ⭐ QUEST INTEGRATION: Only count GUIDED meditations for daily quest
    if (sessionData.type === 'guided' && this.app.gamification) {
      this.app.gamification.progressQuest('daily', 'meditation_session', 1);
    }

    // Check for achievements
    this.checkAchievements();

    // Reset session tracking
    this.sessionStartTime = null;
  }

  checkAchievements() {
    const total = this.app.state?.data?.meditationEntries?.length || 0;
    const gm = this.app.gamification;

    if (!gm) return;

    // First meditation
    if (total === 1) {
      gm.grantAchievement({ 
        id: 'first_meditation', 
        name: 'First Journey Within', 
        xp: 50, 
        icon: '🧘', 
        inspirational: 'You\'ve begun the sacred practice of meditation!' 
      });
    }

    // 10 meditations
    if (total === 10) {
      gm.grantAchievement({ 
        id: 'meditation_10', 
        name: 'Meditation Practitioner', 
        xp: 100, 
        icon: '🕉️', 
        inspirational: '10 meditations! Your inner light grows brighter!' 
      });
    }

    // 50 meditations
    if (total === 50) {
      gm.grantAchievement({ 
        id: 'meditation_50', 
        name: 'Meditation Master', 
        xp: 250, 
        icon: '✨', 
        inspirational: '50 meditations! You are a beacon of inner peace!' 
      });
    }

    // 100 meditations
    if (total === 100) {
      gm.grantAchievement({ 
        id: 'meditation_100', 
        name: 'Enlightened One', 
        xp: 500, 
        icon: '🌟', 
        inspirational: '100 meditations! You walk in pure awareness!' 
      });
    }
  }

  // Map meditation category to chakra
  getChakraFromMeditation(category) {
    const mapping = {
      'Grounding': 'root',
      'Energy': 'sacral',
      'Chakras': 'heart', // Generic chakra meditation
      'Spiritual': 'crown',
      'Healing': 'heart',
      'Manifestation': 'solar'
    };
    return mapping[category] || null;
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  openPDFGuide() {
    if (this.pdfGuideUrl && this.pdfGuideUrl !== 'YOUR_PDF_URL_HERE') {
      window.open(this.pdfGuideUrl, '_blank');
    } else {
      this.app.showToast('ℹ️ PDF Guide is not yet available.', 'info');
    }
  }
}

// Export
if (typeof window !== 'undefined') {
  window.MeditationsEngine = MeditationsEngine;
}
export default MeditationsEngine;