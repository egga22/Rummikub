// Settings management
class Settings {
    constructor() {
        this.modal = document.getElementById('settings-modal');
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        // Open settings modal
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showModal();
        });

        // Close modal
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal();
            });
        });

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Save settings
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
            this.hideModal();
            // Trigger new game with new settings
            if (window.game) {
                window.game.startNewGame();
            }
        });
    }

    showModal() {
        this.modal.classList.add('active');
        this.loadSettingsToForm();
    }

    hideModal() {
        this.modal.classList.remove('active');
    }

    loadSettingsToForm() {
        const settings = this.getSettings();
        document.getElementById('num-players').value = settings.numPlayers;
        document.getElementById('initial-tiles').value = settings.initialTiles;
        document.getElementById('min-initial-meld').value = settings.minInitialMeld;
        document.getElementById('enable-timer').checked = settings.enableTimer;
        document.getElementById('joker-substitution').checked = settings.jokerSubstitution;
    }

    saveSettings() {
        const settings = {
            numPlayers: parseInt(document.getElementById('num-players').value),
            initialTiles: parseInt(document.getElementById('initial-tiles').value),
            minInitialMeld: parseInt(document.getElementById('min-initial-meld').value),
            enableTimer: document.getElementById('enable-timer').checked,
            jokerSubstitution: document.getElementById('joker-substitution').checked
        };

        localStorage.setItem('rummikubSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('rummikubSettings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
        return null;
    }

    getSettings() {
        const saved = this.loadSettings();
        return saved || {
            numPlayers: 4,
            initialTiles: 14,
            minInitialMeld: 30,
            enableTimer: true,
            jokerSubstitution: true
        };
    }
}
