// settings.js

class SettingsManager {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.attachEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        // Navigation
        this.dropdowns = document.querySelectorAll('.settings-dropdown');
        this.panels = document.querySelectorAll('.settings-panel');

        // API Form Elements
        this.apiForm = {
            key: document.getElementById('api-key'),
            secret: document.getElementById('api-secret'),
            saveButton: document.getElementById('save-api'),
            testButton: document.getElementById('test-api'),
            togglePassword: document.querySelector('.toggle-password')
        };

        // Technical Indicators Elements
        this.indicators = {
            rsi: {
                enabled: document.getElementById('rsi-enabled'),
                period: document.getElementById('rsi-period'),
                timeframe: document.getElementById('rsi-timeframe')
            },
            macd: {
                enabled: document.getElementById('macd-enabled'),
                fast: document.getElementById('macd-fast'),
                slow: document.getElementById('macd-slow'),
                signal: document.getElementById('macd-signal')
            },
            saveButton: document.getElementById('save-indicators'),
            resetButton: document.getElementById('reset-indicators')
        };
    }

    initializeState() {
        this.state = {
            currentPanel: 'exchanger-api',
            apiSettings: {
                key: '',
                secret: ''
            },
            indicatorSettings: {
                rsi: {
                    enabled: true,
                    period: 14,
                    timeframe: '4h'
                },
                macd: {
                    enabled: true,
                    fast: 12,
                    slow: 26,
                    signal: 9
                }
            }
        };
    }

    attachEventListeners() {
        // Navigation Event Listeners
        this.dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // API Form Event Listeners
        this.apiForm.saveButton.addEventListener('click', () => this.saveApiSettings());
        this.apiForm.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());

        // Technical Indicators Event Listeners
        this.indicators.saveButton.addEventListener('click', () => this.saveIndicatorSettings());
        this.indicators.resetButton.addEventListener('click', () => this.resetIndicatorSettings());

        // Indicator Toggle Event Listeners
        Object.keys(this.indicators).forEach(key => {
            if (this.indicators[key].enabled) {
                this.indicators[key].enabled.addEventListener('change', (e) => 
                    this.handleIndicatorToggle(key, e.target.checked));
            }
        });
    }

    handleNavigation(e) {
        const targetPanel = e.currentTarget.dataset.target;
        
        // Update active states
        this.dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Show selected panel
        this.panels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(targetPanel).classList.add('active');

        // Update state
        this.state.currentPanel = targetPanel;
    }

    async loadSettings() {
        try {
            // Load API Settings
            const savedApiSettings = localStorage.getItem('apiSettings');
            if (savedApiSettings) {
                const apiSettings = JSON.parse(savedApiSettings);
                this.apiForm.key.value = apiSettings.key || '';
                this.apiForm.secret.value = apiSettings.secret || '';
                this.state.apiSettings = apiSettings;
            }

            // Load Indicator Settings
            const savedIndicatorSettings = localStorage.getItem('indicatorSettings');
            if (savedIndicatorSettings) {
                const indicatorSettings = JSON.parse(savedIndicatorSettings);
                this.updateIndicatorInputs(indicatorSettings);
                this.state.indicatorSettings = indicatorSettings;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showNotification('Error loading settings', 'error');
        }
    }

    async saveApiSettings() {
        try {
            const apiSettings = {
                key: this.apiForm.key.value,
                secret: this.apiForm.secret.value
            };

            // Validate inputs
            if (!apiSettings.key || !apiSettings.secret) {
                this.showNotification('Please fill in all API fields', 'warning');
                return;
            }

            // Save to local storage
            localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
            this.state.apiSettings = apiSettings;

            this.showNotification('API settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving API settings:', error);
            this.showNotification('Error saving API settings', 'error');
        }
    }



    togglePasswordVisibility() {
        const type = this.apiForm.secret.type === 'password' ? 'text' : 'password';
        this.apiForm.secret.type = type;
        
        const icon = this.apiForm.togglePassword.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    async saveIndicatorSettings() {
        try {
            const indicatorSettings = {
                rsi: {
                    enabled: this.indicators.rsi.enabled.checked,
                    period: parseInt(this.indicators.rsi.period.value),
                    timeframe: this.indicators.rsi.timeframe.value
                },
                macd: {
                    enabled: this.indicators.macd.enabled.checked,
                    fast: parseInt(this.indicators.macd.fast.value),
                    slow: parseInt(this.indicators.macd.slow.value),
                    signal: parseInt(this.indicators.macd.signal.value)
                }
            };

            // Validate inputs
            if (!this.validateIndicatorSettings(indicatorSettings)) {
                this.showNotification('Please check indicator parameters', 'warning');
                return;
            }

            // Save to local storage
            localStorage.setItem('indicatorSettings', JSON.stringify(indicatorSettings));
            this.state.indicatorSettings = indicatorSettings;

            this.showNotification('Indicator settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving indicator settings:', error);
            this.showNotification('Error saving indicator settings', 'error');
        }
    }

    resetIndicatorSettings() {
        const defaultSettings = {
            rsi: {
                enabled: true,
                period: 14,
                timeframe: '4h'
            },
            macd: {
                enabled: true,
                fast: 12,
                slow: 26,
                signal: 9
            }
        };

        this.updateIndicatorInputs(defaultSettings);
        this.state.indicatorSettings = defaultSettings;
        localStorage.setItem('indicatorSettings', JSON.stringify(defaultSettings));
        
        this.showNotification('Indicator settings reset to default', 'success');
    }

    handleIndicatorToggle(indicator, enabled) {
        const inputs = this.indicators[indicator];
        Object.keys(inputs).forEach(key => {
            if (key !== 'enabled' && inputs[key]) {
                inputs[key].disabled = !enabled;
            }
        });
    }

    updateIndicatorInputs(settings) {
        // Update RSI inputs
        if (settings.rsi) {
            this.indicators.rsi.enabled.checked = settings.rsi.enabled;
            this.indicators.rsi.period.value = settings.rsi.period;
            this.indicators.rsi.timeframe.value = settings.rsi.timeframe;
        }

        // Update MACD inputs
        if (settings.macd) {
            this.indicators.macd.enabled.checked = settings.macd.enabled;
            this.indicators.macd.fast.value = settings.macd.fast;
            this.indicators.macd.slow.value = settings.macd.slow;
            this.indicators.macd.signal.value = settings.macd.signal;
        }

        // Update disabled states
        Object.keys(settings).forEach(indicator => {
            this.handleIndicatorToggle(indicator, settings[indicator].enabled);
        });
    }

    validateIndicatorSettings(settings) {
        // Validate RSI settings
        if (settings.rsi.enabled) {
            if (settings.rsi.period < 1 || settings.rsi.period > 100) return false;
        }

        // Validate MACD settings
        if (settings.macd.enabled) {
            if (settings.macd.fast < 1 || settings.macd.fast > 50) return false;
            if (settings.macd.slow < 1 || settings.macd.slow > 100) return false;
            if (settings.macd.signal < 1 || settings.macd.signal > 50) return false;
            if (settings.macd.fast >= settings.macd.slow) return false;
        }

        return true;
    }

    showNotification(message, type = 'info') {
        window.notificationManager.show(message, type);
    }
}

// Initialize Settings Manager when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});