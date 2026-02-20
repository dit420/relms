export class UserManager {
    constructor() {
        this.data = this._load();
    }

    _load() {
        const stored = localStorage.getItem('user-profile');
        if (stored) {
            const data = JSON.parse(stored);
            // Ensure default structure if upgrading from older version (though this is new)
            if (!data.equipped) data.equipped = { theme: 'theme_midnight', frame: 'frame_minimal' };
            return data;
        }
        return {
            aura: 500, // Welcome gift
            inventory: ['theme_midnight', 'frame_minimal'],
            equipped: {
                theme: 'theme_midnight',
                frame: 'frame_minimal'
            }
        };
    }

    _save() {
        localStorage.setItem('user-profile', JSON.stringify(this.data));
        // dispatch event for UI update
        window.dispatchEvent(new CustomEvent('user-update', { detail: this.data }));
    }

    get aura() { return this.data.aura; }
    get inventory() { return this.data.inventory; }

    getEquipped(type) {
        return this.data.equipped[type];
    }

    hasItem(itemId) {
        return this.data.inventory.includes(itemId);
    }

    buyItem(item) {
        if (this.hasItem(item.id)) return true;
        if (item.price > this.data.aura) return false;

        this.data.aura -= item.price;
        this.data.inventory.push(item.id);
        this._save();
        return true;
    }

    equipItem(type, itemId) {
        if (!this.hasItem(itemId)) return false;

        this.data.equipped[type] = itemId;
        this._save();

        // Dispatch specific event for engine to pick up
        window.dispatchEvent(new CustomEvent('item-equip', {
            detail: { type, itemId }
        }));
        return true;
    }
}
