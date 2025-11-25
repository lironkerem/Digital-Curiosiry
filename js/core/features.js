// js/features.js – production engine router  (PATCHED 2025-06-25)
/* ----------  engines  ---------- */
import EnergyEngineEnhanced from '../engines/energy-engine-enhanced.js';
import KarmaShopEngine      from '../engines/KarmaShopEngine.js';
import MeditationsEngine    from '../engines/meditations.js';
import TarotEngine          from '../engines/TarotEngine.js';
import HappinessEngine      from '../engines/happiness.js';
import GratitudeEngine      from '../engines/gratitude.js';
import QuotesEngine         from '../engines/quotes.js';
import AffirmationsEngine   from '../engines/affirmationsengine.js';
import GamificationEngine   from '../engines/GamificationEngine.js';
import JournalEngine        from '../engines/journal.js';
import ShadowAlchemyEngine  from '../engines/shadowalchemy.js';

/* ----------  apps  ---------- */
import SelfAnalysisLauncher from '../apps/selfanalysis/loader.js';
import FlipTheScriptApp     from '../apps/flipthescript/index.js';

const MAP = {
  meditations    : MeditationsEngine,
  tarot          : TarotEngine,
  energy         : EnergyEngineEnhanced,
  happiness      : HappinessEngine,
  gratitude      : GratitudeEngine,
  quotes         : QuotesEngine,
  affirmations   : AffirmationsEngine,
  progress       : GamificationEngine,
  calculator: SelfAnalysisLauncher,
  'flip-script'  : FlipTheScriptApp,   
   journal        : JournalEngine,
  'shadow-alchemy': ShadowAlchemyEngine,
  'karma-shop'   : KarmaShopEngine
};

class FeaturesManager {
  constructor(app) {
    this.app = app;
    this.engines = {};
  }

  init(id) {
    const EngineClass = MAP[id];
    if (!EngineClass) {
      console.error(`Unknown feature: ${id}`);
      return;
    }
    // instantiate once, cache forever
    let engine = this.engines[id] ??= new EngineClass(this.app);
    engine.render?.() ?? console.warn(`Engine ${id} has no render() method`);
  }
}

// expose to window for legacy code that expects globals
if (typeof window !== 'undefined') {
  window.FeaturesManager = FeaturesManager;
  // optional: expose individual engines if any legacy code needs them
  Object.assign(window, MAP);
}

export default FeaturesManager;