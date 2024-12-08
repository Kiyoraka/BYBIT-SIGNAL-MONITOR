class ThemeHandler {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadSavedTheme();
    }

    initializeElements() {
        this.themeRadios = document.querySelectorAll('input[name="theme"]');
        this.accentColorPicker = document.getElementById('accent-color');
        this.applyButton = document.getElementById('apply-theme');
        this.resetButton = document.getElementById('reset-theme');
        this.root = document.documentElement;

        // Default theme values
        this.defaultTheme = {
            name: 'default',
            accentColor: '#4f46e5',
            background: 'linear-gradient(135deg, #0ea5e9, #4f46e5)',
            textColor: '#ffffff',
            glassOpacity: '0.1',
            glassBlur: '12px'
        };
    }

    attachEventListeners() {
        // Apply theme button
        this.applyButton.addEventListener('click', () => {
            const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
            const accentColor = this.accentColorPicker.value;
            this.applyTheme(selectedTheme, accentColor);
        });

        // Reset button
        this.resetButton.addEventListener('click', () => {
            this.resetToDefault();
        });

        // Live preview when selecting themes
        this.themeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.previewTheme(radio.value);
            });
        });

        // Live preview for accent color
        this.accentColorPicker.addEventListener('input', (e) => {
            this.updateAccentColor(e.target.value);
        });
    }

    applyTheme(themeName, accentColor) {
        const themeStyles = this.getThemeStyles(themeName);
        
        // Apply the theme styles
        this.root.style.setProperty('--primary-color', accentColor);
        this.root.style.setProperty('--glass-bg', themeStyles.glassBackground);
        this.root.style.setProperty('--text-color', themeStyles.textColor);
        
        // Apply background
        document.querySelector('.background').style.background = themeStyles.background;

        // Save theme preferences
        localStorage.setItem('theme', JSON.stringify({
            name: themeName,
            accentColor: accentColor
        }));

        // Show success notification
        if (window.notificationManager) {
            window.notificationManager.show('Theme applied successfully', 'success');
        }
    }

    getThemeStyles(themeName) {
        switch(themeName) {
            case 'dark':
                return {
                    background: '#1a1a1a',
                    glassBackground: 'rgba(255, 255, 255, 0.05)',
                    textColor: '#ffffff'
                };
            case 'light':
                return {
                    background: '#f8f9fa',
                    glassBackground: 'rgba(0, 0, 0, 0.05)',
                    textColor: '#1f2937'
                };
            default: // default theme
                return {
                    background: 'linear-gradient(135deg, #0ea5e9, #4f46e5)',
                    glassBackground: 'rgba(255, 255, 255, 0.1)',
                    textColor: '#ffffff'
                };
        }
    }

    previewTheme(themeName) {
        const themeStyles = this.getThemeStyles(themeName);
        this.root.style.setProperty('--preview-background', themeStyles.background);
    }

    updateAccentColor(color) {
        this.root.style.setProperty('--preview-accent', color);
    }

    resetToDefault() {
        // Reset radio button
        document.querySelector('input[value="default"]').checked = true;

        // Reset accent color
        this.accentColorPicker.value = this.defaultTheme.accentColor;

        // Apply default theme
        this.applyTheme('default', this.defaultTheme.accentColor);

        // Show notification
        if (window.notificationManager) {
            window.notificationManager.show('Theme reset to default', 'success');
        }
    }

    loadSavedTheme() {
        try {
            const savedTheme = JSON.parse(localStorage.getItem('theme'));
            if (savedTheme) {
                // Set radio button
                document.querySelector(`input[value="${savedTheme.name}"]`).checked = true;
                
                // Set accent color
                this.accentColorPicker.value = savedTheme.accentColor;
                
                // Apply theme
                this.applyTheme(savedTheme.name, savedTheme.accentColor);
            }
        } catch (error) {
            console.error('Error loading saved theme:', error);
            this.resetToDefault();
        }
    }
}

// Initialize Theme Handler when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeHandler = new ThemeHandler();
});