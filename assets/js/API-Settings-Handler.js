class APISettings {
    constructor() {
        this.API_BASE_URL = 'http://localhost:5000/api';
        this.initializeElements();
        this.attachEventListeners();
        this.loadExistingCredentials();
    }

    initializeElements() {
        this.apiKeyInput = document.getElementById('api-key');
        this.apiSecretInput = document.getElementById('api-secret');
        this.saveButton = document.getElementById('save-api');
        this.testButton = document.getElementById('test-api');
        this.togglePasswordButton = document.querySelector('.toggle-password');
    }

    showNotification(message, type) {
        window.notificationManager.show(message, type);
    }
    
    attachEventListeners() {
        // Save API credentials
        this.saveButton.addEventListener('click', async (e) => {
            // Prevent default form submission behavior
            e.preventDefault();
            
            const apiKey = this.apiKeyInput.value.trim();
            const apiSecret = this.apiSecretInput.value.trim();

            if (!apiKey || !apiSecret) {
                this.showNotification('Please fill in all API fields', 'warning');
                return;
            }

            // Disable save button while processing
            this.saveButton.disabled = true;
            this.saveButton.innerHTML = 'Saving...';

            try {
                const response = await fetch(`${this.API_BASE_URL}/save_credentials`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        api_secret: apiSecret
                    })
                });

                const data = await response.json();
                if (data.success) {
                    this.showNotification('API credentials saved successfully', 'success');
                } else {
                    this.showNotification(data.message || 'Error saving credentials', 'error');
                }
            } catch (error) {
                console.error('Error saving credentials:', error);
                this.showNotification('Error saving API credentials', 'error');
            } finally {
                // Re-enable save button and restore text
                this.saveButton.disabled = false;
                this.saveButton.innerHTML = 'Save Changes';
            }
        });

        // Test API connection
        this.testButton.addEventListener('click', async (e) => {
            // Prevent default form submission behavior
            e.preventDefault();
            
            const apiKey = this.apiKeyInput.value.trim();
            const apiSecret = this.apiSecretInput.value.trim();

            if (!apiKey || !apiSecret) {
                this.showNotification('Please fill in all API fields', 'warning');
                return;
            }

            this.testButton.disabled = true;
            this.testButton.innerHTML = 'Testing...';

            try {
                const response = await fetch(`${this.API_BASE_URL}/test_connection`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        api_secret: apiSecret
                    })
                });

                const data = await response.json();
                this.showNotification(
                    data.success ? 'API connection successful' : data.message,
                    data.success ? 'success' : 'error'
                );
            } catch (error) {
                console.error('Error testing connection:', error);
                this.showNotification('Error testing API connection', 'error');
            } finally {
                this.testButton.disabled = false;
                this.testButton.innerHTML = 'Test Connection';
            }
        });

        // Toggle password visibility
        this.togglePasswordButton.addEventListener('click', (e) => {
            e.preventDefault();
            const type = this.apiSecretInput.type === 'password' ? 'text' : 'password';
            this.apiSecretInput.type = type;
            
            const icon = this.togglePasswordButton.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    async loadExistingCredentials() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/load_credentials`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success && data.credentials) {
                this.apiKeyInput.value = data.credentials.api_key || '';
                this.apiSecretInput.value = data.credentials.api_secret || '';
            }
        } catch (error) {
            console.error('Error loading credentials:', error);
        }
    }

}

// Initialize API Settings when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.apiSettings = new APISettings();
});