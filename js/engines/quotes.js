// ============================================
// QUOTES ENGINE (NO CHANGES)
// ============================================
class QuotesEngine {
  constructor(app) {
    this.app = app;
    this.quotes = [
      { text: "The quieter you become, the more you are able to hear", author: "Rumi" },
      { text: "Be the change you wish to see in the world", author: "Gandhi" },
      { text: "Peace comes from within. Do not seek it without", author: "Buddha" }
    ];
  }

  render() {
    const tab = document.getElementById('quotes-tab');
    const dailyQuote = this.getDailyQuote();

    tab.innerHTML = `
      <div class="min-h-screen bg-gray-900 p-6">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-4xl font-bold text-white mb-4">Wisdom & Quotes</h2>
          <p class="text-gray-400 mb-8">Inspiration from spiritual teachers</p>

          <div class="bg-gradient-to-r from-purple-900 to-blue-900 rounded-3xl p-12 mb-12 text-center border border-purple-500/30">
            <p class="text-purple-200 text-sm uppercase tracking-wider mb-6">Quote of the Day</p>
            <p class="text-white text-4xl font-light italic mb-8">"${dailyQuote.text}"</p>
            <p class="text-purple-300 text-xl">— ${dailyQuote.author}</p>
          </div>

          <h3 class="text-2xl font-bold text-white mb-6">All Quotes</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${this.quotes.map(quote => `
              <div class="card">
                <p class="text-white text-lg italic mb-4">"${quote.text}"</p>
                <p class="text-purple-400">— ${quote.author}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  getDailyQuote() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return this.quotes[dayOfYear % this.quotes.length];
  }
}
export default QuotesEngine;