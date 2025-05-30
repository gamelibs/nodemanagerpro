// API Testing Interface
class ApiTester {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.init();
    }

    init() {
        // Initialize event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.testConnection();
        });
    }

    setupEventListeners() {
        // Test Health endpoint
        const healthBtn = document.getElementById('test-health');
        if (healthBtn) {
            healthBtn.addEventListener('click', () => this.testHealth());
        }

        // Test Users endpoint
        const usersBtn = document.getElementById('test-users');
        if (usersBtn) {
            usersBtn.addEventListener('click', () => this.testUsers());
        }

        // Custom API test
        const customBtn = document.getElementById('test-custom');
        if (customBtn) {
            customBtn.addEventListener('click', () => this.testCustom());
        }

        // Clear results
        const clearBtn = document.getElementById('clear-results');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearResults());
        }
    }

    async testConnection() {
        try {
            const response = await fetch('http://localhost:3000/');
            if (response.ok) {
                const data = await response.json();
                this.showResult('Connection', data, true);
                this.updateConnectionStatus(true);
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.showResult('Connection', { error: error.message }, false);
            this.updateConnectionStatus(false);
        }
    }

    async testHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            this.showResult('Health Check', data, response.ok);
        } catch (error) {
            this.showResult('Health Check', { error: error.message }, false);
        }
    }

    async testUsers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users`);
            const data = await response.json();
            this.showResult('Users API', data, response.ok);
        } catch (error) {
            this.showResult('Users API', { error: error.message }, false);
        }
    }

    async testCustom() {
        const endpoint = document.getElementById('custom-endpoint').value;
        if (!endpoint) {
            alert('Please enter an API endpoint');
            return;
        }

        try {
            const url = endpoint.startsWith('/') ? `http://localhost:3000${endpoint}` : endpoint;
            const response = await fetch(url);
            const data = await response.json();
            this.showResult(`Custom: ${endpoint}`, data, response.ok);
        } catch (error) {
            this.showResult(`Custom: ${endpoint}`, { error: error.message }, false);
        }
    }

    showResult(title, data, success) {
        const resultsDiv = document.getElementById('api-results');
        const timestamp = new Date().toLocaleTimeString();
        
        const resultElement = document.createElement('div');
        resultElement.className = `result ${success ? 'success' : 'error'}`;
        resultElement.innerHTML = `
            <div class="result-header">
                <h4>${title}</h4>
                <span class="timestamp">${timestamp}</span>
            </div>
            <pre class="result-data">${JSON.stringify(data, null, 2)}</pre>
        `;

        resultsDiv.insertBefore(resultElement, resultsDiv.firstChild);
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = connected ? 'Connected' : 'Disconnected';
            statusElement.className = `status ${connected ? 'connected' : 'disconnected'}`;
        }
    }

    clearResults() {
        const resultsDiv = document.getElementById('api-results');
        resultsDiv.innerHTML = '';
    }
}

// Theme Toggle Functionality
class ThemeToggle {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupThemeToggle();
            this.loadTheme();
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.updateThemeToggleIcon(newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeToggleIcon(savedTheme);
    }

    updateThemeToggleIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// Smooth Scrolling
function setupSmoothScrolling() {
    document.addEventListener('DOMContentLoaded', () => {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    });
}

// Initialize all functionality
new ApiTester();
new ThemeToggle();
setupSmoothScrolling();

// Add some interactive feedback
document.addEventListener('DOMContentLoaded', () => {
    // Add click animations to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});
