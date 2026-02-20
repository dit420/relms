import { ITEMS } from '../data/items.js';

export class Marketplace {
    constructor(userManager) {
        this.userManager = userManager;
        this.element = this._create();
        this.currentTab = 'themes';
        this._bindEvents();
        this.update();
    }

    _create() {
        const div = document.createElement('div');
        div.className = 'marketplace glass-panel hidden';
        div.innerHTML = `
            <div class="mp-header">
                <div>
                    <h2>MARKETPLACE</h2>
                    <div class="mp-subtitle">Customize Your Reality</div>
                </div>
                <div class="mp-balance-box">
                    <span class="currency-icon">💠</span>
                    <span id="mp-aura" class="currency-amount">0</span>
                    <span class="currency-label">AURA</span>
                </div>
                <button class="close-btn">✕</button>
            </div>
            
            <div class="mp-tabs">
                <button class="mp-tab active" data-tab="themes">THEMES</button>
                <button class="mp-tab" data-tab="frames">FRAMES</button>
            </div>
            
            <div class="mp-content">
                <div class="mp-grid" id="mp-grid">
                    <!-- Items injected here -->
                </div>
            </div>
        `;
        return div;
    }

    _bindEvents() {
        this.element.querySelector('.close-btn').addEventListener('click', () => this.close());

        this.element.querySelectorAll('.mp-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.element.querySelectorAll('.mp-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTab = btn.dataset.tab;
                this.renderGrid();
            });
        });

        // Listen for balance updates
        window.addEventListener('user-update', () => this.update());
    }

    update() {
        this.element.querySelector('#mp-aura').textContent = this.userManager.aura;
        this.renderGrid();
    }

    renderGrid() {
        const grid = this.element.querySelector('#mp-grid');
        grid.innerHTML = '';

        const items = ITEMS[this.currentTab];
        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'mp-item glass-light';

            const owned = this.userManager.hasItem(item.id);
            const equipped = this.userManager.getEquipped(item.type) === item.id;
            const canAfford = this.userManager.aura >= item.price;

            let actionBtn = '';
            if (equipped) {
                actionBtn = `<button class="mp-btn equipped" disabled>EQUIPPED</button>`;
            } else if (owned) {
                actionBtn = `<button class="mp-btn equip" data-id="${item.id}">EQUIP</button>`;
            } else {
                actionBtn = `<button class="mp-btn buy ${canAfford ? '' : 'disabled'}" data-id="${item.id}">
                    ${item.price > 0 ? item.price : 'FREE'} 💠
                </button>`;
            }

            // Preview logic
            let preview = '';
            if (item.type === 'theme') {
                preview = `<div class="mp-preview theme" style="background: ${item.previewColor}"></div>`;
            } else {
                preview = `<div class="mp-preview frame ${item.previewClass}"></div>`;
            }

            el.innerHTML = `
                ${preview}
                <div class="mp-item-info">
                    <div class="mp-item-name">${item.name}</div>
                    <div class="mp-item-desc">${item.description}</div>
                </div>
                <div class="mp-item-action">
                    ${actionBtn}
                </div>
            `;

            // Bind action
            const btn = el.querySelector('.mp-btn');
            if (btn && !btn.disabled) {
                btn.addEventListener('click', () => {
                    if (owned) {
                        this.userManager.equipItem(item.type, item.id);
                        this.update();
                    } else if (canAfford) {
                        if (this.userManager.buyItem(item)) {
                            // Flash success?
                            this.update();
                        }
                    }
                });
            }

            grid.appendChild(el);
        });
    }

    open() {
        this.element.classList.remove('hidden');
        this.update();
    }

    close() {
        this.element.classList.add('hidden');
    }
}
