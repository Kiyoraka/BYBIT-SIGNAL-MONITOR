class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.appContainer = document.getElementById('app-container');
        this.progressBar = document.querySelector('.progress-bar');
        this.loadingText = document.querySelector('.loading-text');
        this.progress = 0;
        this.loadingTexts = [
            'Initializing Trading System...'
        ];
        this.currentTextIndex = 0;
    }

    // Start the loading sequence
    start() {
        this.updateProgress();
        this.updateLoadingText();
        return new Promise(resolve => {
            this.completionCallback = resolve;
        });
    }

    // Update progress bar
    updateProgress() {
        const interval = setInterval(() => {
            if (this.progress < 100) {
                this.progress += Math.random() * 15;
                if (this.progress > 100) this.progress = 100;
                
                this.progressBar.style.width = `${this.progress}%`;
                
                // Update loading text at certain progress points
                if (this.progress > this.currentTextIndex * 25) {
                    this.currentTextIndex++;
                    this.updateLoadingText();
                }
            } else {
                clearInterval(interval);
                this.complete();
            }
        }, 500);
    }

    // Update loading text
    updateLoadingText() {
        if (this.currentTextIndex < this.loadingTexts.length) {
            this.loadingText.style.opacity = '0';
            setTimeout(() => {
                this.loadingText.textContent = this.loadingTexts[this.currentTextIndex];
                this.loadingText.style.opacity = '1';
            }, 200);
        }
    }

    // Complete loading sequence
    complete() {
        setTimeout(() => {
            // Fade out loading screen
            this.loadingScreen.classList.add('fade-out');
            
            // Show main container
            this.appContainer.classList.remove('hidden');
            setTimeout(() => {
                this.appContainer.classList.add('visible');
            }, 50);

            // Remove loading screen after animation
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                if (this.completionCallback) {
                    this.completionCallback();
                }
            }, 500);
        }, 500);
    }

    // Force complete loading (can be called externally)
    forceComplete() {
        this.progress = 100;
        this.progressBar.style.width = '100%';
        this.complete();
    }
}

// Initialize loading screen
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = new LoadingScreen();
    
    // Start loading sequence
    loadingScreen.start().then(() => {
        console.log('Loading complete');
        // You can initialize your dashboard here
    });

    // Optional: Force complete loading after timeout
    setTimeout(() => {
        loadingScreen.forceComplete();
    }, 10000); // Force complete after 10 seconds if not already done
});