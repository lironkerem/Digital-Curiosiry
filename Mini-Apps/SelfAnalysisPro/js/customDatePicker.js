// js/customDatePicker.js - Mobile-friendly date picker with dropdowns

export class CustomDatePicker {
  constructor(inputId) {
    this.input = document.getElementById(inputId);
    this.container = null;
    this.dropdowns = { year: null, month: null, day: null };
    this.init();
  }

  init() {
    if (!this.input) return;

    // Create custom picker container
    this.createPickerUI();

    // Hide native date input on mobile
    if (this.isMobile()) {
      this.input.type = 'text';
      this.input.readOnly = true;
      this.input.placeholder = 'Select date...';
    }

    // Show custom picker on click
    this.input.addEventListener('click', (e) => {
      if (this.isMobile()) {
        e.preventDefault();
        this.show();
      }
    });

    this.input.addEventListener('focus', (e) => {
      if (this.isMobile()) {
        e.preventDefault();
        this.input.blur();
        this.show();
      }
    });
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
           || window.innerWidth <= 768;
  }

  createPickerUI() {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-date-picker-overlay';
    wrapper.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      align-items: center;
      justify-content: center;
    `;

    const picker = document.createElement('div');
    picker.className = 'custom-date-picker';
    picker.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 25px;
      max-width: 90%;
      width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    picker.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #3F7652; font-size: 24px;">Select Date of Birth</h3>
        <button class="close-picker" style="
          background: none;
          border: none;
          font-size: 30px;
          color: #666;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 30px;
          height: 30px;
        ">&times;</button>
      </div>

      <!-- Tab Selection -->
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button class="tab-btn active" data-tab="dropdown" style="
          flex: 1;
          padding: 10px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Amatic SC', cursive;
          background: #3F7652;
          color: white;
          border: 2px solid #3F7652;
          border-radius: 10px;
          cursor: pointer;
        ">Dropdowns</button>
        <button class="tab-btn" data-tab="manual" style="
          flex: 1;
          padding: 10px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Amatic SC', cursive;
          background: white;
          color: #3F7652;
          border: 2px solid #3F7652;
          border-radius: 10px;
          cursor: pointer;
        ">Type Date</button>
      </div>

      <!-- Dropdown Tab -->
      <div id="dropdown-tab" class="tab-content" style="display: block;">
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <div style="flex: 2;">
            <label style="display: block; margin-bottom: 5px; color: #3F7652; font-weight: 600; font-size: 16px;">Month</label>
            <select id="custom-month" style="
              width: 100%;
              padding: 12px;
              font-size: 16px;
              border: 2px solid #3F7652;
              border-radius: 10px;
              font-family: 'Amatic SC', cursive;
              background: white;
            ">
              <option value="">Month</option>
            </select>
          </div>

          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 5px; color: #3F7652; font-weight: 600; font-size: 16px;">Day</label>
            <select id="custom-day" style="
              width: 100%;
              padding: 12px;
              font-size: 16px;
              border: 2px solid #3F7652;
              border-radius: 10px;
              font-family: 'Amatic SC', cursive;
              background: white;
            ">
              <option value="">Day</option>
            </select>
          </div>

          <div style="flex: 1.5;">
            <label style="display: block; margin-bottom: 5px; color: #3F7652; font-weight: 600; font-size: 16px;">Year</label>
            <select id="custom-year" style="
              width: 100%;
              padding: 12px;
              font-size: 16px;
              border: 2px solid #3F7652;
              border-radius: 10px;
              font-family: 'Amatic SC', cursive;
              background: white;
            ">
              <option value="">Year</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Manual Input Tab -->
      <div id="manual-tab" class="tab-content" style="display: none;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; color: #3F7652; font-weight: 600; font-size: 16px;">
            Enter date (MM/DD/YYYY or YYYY-MM-DD)
          </label>
          <input type="text" id="manual-date-input" placeholder="e.g., 05/15/1990 or 1990-05-15" style="
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border: 2px solid #3F7652;
            border-radius: 10px;
            font-family: 'Amatic SC', cursive;
          ">
          <div style="margin-top: 8px; font-size: 14px; color: #666;">
            Examples: 03/21/1985 or 1985-03-21
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="picker-cancel" style="
          flex: 1;
          padding: 15px;
          font-size: 18px;
          font-weight: 700;
          font-family: 'Amatic SC', cursive;
          background: #ddd;
          color: #333;
          border: none;
          border-radius: 15px;
          cursor: pointer;
        ">Cancel</button>
        <button class="picker-confirm" style="
          flex: 1;
          padding: 15px;
          font-size: 18px;
          font-weight: 700;
          font-family: 'Amatic SC', cursive;
          background: #3F7652;
          color: white;
          border: none;
          border-radius: 15px;
          cursor: pointer;
        ">Confirm</button>
      </div>
    `;

    wrapper.appendChild(picker);
    document.body.appendChild(wrapper);
    this.container = wrapper;

    // Populate dropdowns
    this.populateMonths();
    this.populateYears();
    this.populateDays();

    // Store references
    this.dropdowns.year = picker.querySelector('#custom-year');
    this.dropdowns.month = picker.querySelector('#custom-month');
    this.dropdowns.day = picker.querySelector('#custom-day');

    // Event listeners
    this.dropdowns.month.addEventListener('change', () => this.updateDays());
    this.dropdowns.year.addEventListener('change', () => this.updateDays());

    picker.querySelector('.close-picker').addEventListener('click', () => this.hide());
    picker.querySelector('.picker-cancel').addEventListener('click', () => this.hide());
    picker.querySelector('.picker-confirm').addEventListener('click', () => this.confirm());

    // Close on overlay click
    wrapper.addEventListener('click', (e) => {
      if (e.target === wrapper) this.hide();
    });
  }

  populateMonths() {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const select = this.container.querySelector('#custom-month');
    months.forEach((month, index) => {
      const option = document.createElement('option');
      option.value = index + 1;
      option.textContent = month;
      select.appendChild(option);
    });
  }

  populateYears() {
    const select = this.container.querySelector('#custom-year');
    const currentYear = new Date().getFullYear();
    
    // From current year down to 1920
    for (let year = currentYear; year >= 1920; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      select.appendChild(option);
    }
  }

  populateDays() {
    const select = this.container.querySelector('#custom-day');
    select.innerHTML = '<option value="">Day</option>';
    
    // Default to 31 days
    for (let day = 1; day <= 31; day++) {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day;
      select.appendChild(option);
    }
  }

  updateDays() {
    const year = parseInt(this.dropdowns.year.value) || 2000;
    const month = parseInt(this.dropdowns.month.value);
    
    if (!month) return;

    // Get days in selected month
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = parseInt(this.dropdowns.day.value);

    const select = this.dropdowns.day;
    select.innerHTML = '<option value="">Day</option>';
    
    for (let day = 1; day <= daysInMonth; day++) {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day;
      if (day === currentDay && day <= daysInMonth) {
        option.selected = true;
      }
      select.appendChild(option);
    }
  }

  show() {
    // Pre-fill with current value if exists
    const currentValue = this.input.value;
    if (currentValue) {
      const [year, month, day] = currentValue.split('-');
      if (year) this.dropdowns.year.value = parseInt(year);
      if (month) this.dropdowns.month.value = parseInt(month);
      if (day) this.dropdowns.day.value = parseInt(day);
      this.updateDays();
    }

    this.container.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.container.style.display = 'none';
    document.body.style.overflow = '';
  }

  confirm() {
    const year = this.dropdowns.year.value;
    const month = this.dropdowns.month.value.padStart(2, '0');
    const day = this.dropdowns.day.value.padStart(2, '0');

    if (!year || !month || !day) {
      alert('Please select all fields');
      return;
    }

    // Format as YYYY-MM-DD
    const dateString = `${year}-${month}-${day}`;
    
    // Update input
    this.input.value = dateString;
    
    // Trigger change event
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
    this.input.dispatchEvent(new Event('input', { bubbles: true }));

    this.hide();
  }
}

// Auto-initialize on DOM load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.customDatePicker = new CustomDatePicker('date-of-birth');
  });
}
