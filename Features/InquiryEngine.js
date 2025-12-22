// InquiryEngine.js
// Engine to manage daily inquiry selection, progression, and user adaptation

import { InquiryList } from './InquiryList.js';

export class InquiryEngine {
  constructor(userLevel = 'beginner') {
    this.userLevel = userLevel; // 'beginner', 'intermediate', 'advanced'
    this.todaySelections = [];
  }

  // Map user level to allowed intensity range
  getAllowedIntensities() {
    switch(this.userLevel) {
      case 'beginner':
        return [1, 2];
      case 'intermediate':
        return [1, 2, 3];
      case 'advanced':
        return [1, 2, 3, 4];
      default:
        return [1, 2];
    }
  }

  // Get random question from a domain, respecting intensity and previously selected today
  getRandomQuestion(domain) {
    const allowedIntensities = this.getAllowedIntensities();
    const candidates = InquiryList.filter(q => 
      q.domain === domain && 
      allowedIntensities.includes(q.intensity) && 
      !this.todaySelections.includes(q.id)
    );

    if(candidates.length === 0) {
      // If no candidates left, reset todaySelections for this domain
      this.todaySelections = this.todaySelections.filter(id => {
        const q = InquiryList.find(q => q.id === id);
        return q.domain !== domain;
      });
      return this.getRandomQuestion(domain);
    }

    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    this.todaySelections.push(choice.id);
    return choice;
  }

  // Generate daily inquiries for all domains (or selected domains)
  generateDailyInquiries(domains = null) {
    const selectedDomains = domains || Object.values(InquiryList.reduce((acc, q) => {
      acc[q.domain] = true;
      return acc;
    }, {}));

    const dailyInquiries = selectedDomains.map(domain => this.getRandomQuestion(domain));
    return dailyInquiries;
  }

  // Set user level dynamically
  setUserLevel(level) {
    this.userLevel = level;
  }

  // Reset daily selections (to run after midnight)
  resetDailySelections() {
    this.todaySelections = [];
  }
}
