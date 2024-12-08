class NotificationManager {
    constructor() {
        this.initializeContainer();
    }

    initializeContainer() {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        this.container = container;
    }

    show(message, type = 'info') {
        // Remove existing notifications of the same type
        const existingNotifications = this.container.querySelectorAll(`.notification.${type}`);
        existingNotifications.forEach(notification => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message;

        // Add to container
        this.container.appendChild(notification);

        // Remove after delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Create global instance
window.notificationManager = new NotificationManager();