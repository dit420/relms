/**
 * HUD — Heads-Up Display overlay for the realm view.
 */

import { VISITORS } from '../data/realms.js';

export class HUD {
  constructor() {
    this.element = this._create();
  }

  _create() {
    const hud = document.createElement('div');
    hud.className = 'hud';
    hud.id = 'hud';

    hud.innerHTML = `
      <div class="hud-top">
        <div class="hud-profile glass">
          <div class="hud-avatar" id="hud-avatar"></div>
          <div class="hud-user-info">
            <div class="hud-username" id="hud-username"></div>
            <div class="hud-activity-badge">
              <div class="dot"></div>
              <span id="hud-activity"></span>
            </div>
          </div>
        </div>
        <div class="hud-weather glass" id="hud-weather">
          <div class="hud-weather-icon" id="hud-weather-icon">🌍</div>
          <div class="hud-weather-info">
            <div class="hud-weather-temp" id="hud-weather-temp">--</div>
            <div class="hud-weather-city" id="hud-weather-city"></div>
          </div>
        </div>
      </div>

      <div class="pan-hint" id="pan-hint">
        <div class="pan-hint-icon">👆</div>
        <div class="pan-hint-text">DRAG TO EXPLORE</div>
      </div>

      <div class="hud-bottom">
        <div class="hud-visitors glass">
          <div class="hud-visitor-avatars">
            ${VISITORS.map(v => `<div class="v-avatar">${v.emoji}</div>`).join('')}
          </div>
          <span>${VISITORS.length} visitors here</span>
        </div>
        <div class="hud-actions">
          <button class="hud-btn hud-btn-primary" id="btn-interact">
            ✨ Leave a Mark
          </button>
          <button class="hud-btn hud-btn-primary" id="btn-edit" style="display:none; background: linear-gradient(135deg, #39ff14, #00cc44);">
            ✏️ Edit Realm
          </button>
          <button class="hud-btn hud-btn-primary" id="btn-arrange" style="display:none; background: linear-gradient(135deg, #00f0ff, #0077ff);">
            🗺️ Arrange
          </button>
          <button class="hud-btn hud-btn-ghost" id="btn-back">
            ← Lobby
          </button>
        </div>
      </div>
    `;

    return hud;
  }

  show() {
    this.element.classList.add('active');

    // Hide pan hint after 5 seconds
    setTimeout(() => {
      const hint = this.element.querySelector('#pan-hint');
      if (hint) {
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.5s ease';
        setTimeout(() => hint.remove(), 500);
      }
    }, 5000);
  }

  hide() {
    this.element.classList.remove('active');
  }

  updateProfile(realm) {
    this.element.querySelector('#hud-avatar').textContent = realm.avatar;
    this.element.querySelector('#hud-username').textContent = `${realm.owner}'s Realm`;
    this.element.querySelector('#hud-activity').textContent = realm.activityLabel;
    this.element.querySelector('#hud-weather-city').textContent = realm.city;
  }

  updateWeather(weatherInfo) {
    this.element.querySelector('#hud-weather-icon').textContent = weatherInfo.icon;
    this.element.querySelector('#hud-weather-temp').textContent = weatherInfo.temp;
  }

  showEditButton() {
    const btn = this.element.querySelector('#btn-edit');
    if (btn) btn.style.display = '';
  }

  showArrangeButton() {
    const btn = this.element.querySelector('#btn-arrange');
    if (btn) btn.style.display = '';
  }

  onInteract(callback) {
    this.element.querySelector('#btn-interact').addEventListener('click', callback);
  }

  onEdit(callback) {
    this.element.querySelector('#btn-edit').addEventListener('click', callback);
  }

  onBack(callback) {
    this.element.querySelector('#btn-back').addEventListener('click', callback);
  }

  onArrange(callback) {
    this.element.querySelector('#btn-arrange').addEventListener('click', callback);
  }
}
