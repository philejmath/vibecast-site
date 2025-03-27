/**
 * Vibecast.me - Main JavaScript
 * Handles form submissions, animations, and other interactive elements
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');
    const signupSuccess = document.getElementById('signup-success');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            // In a real application, you would send this data to a server
            // For now, we'll just store it in localStorage and show a success message
            saveSubscriber(name, email);
            
            // Show success message
            signupSuccess.classList.remove('d-none');
            
            // Reset form
            signupForm.reset();
            
            // Hide success message after 5 seconds
            setTimeout(function() {
                signupSuccess.classList.add('d-none');
            }, 5000);
        });
    }
    
    // Initialize any tooltips
    initTooltips();
    
    // Add smooth scrolling for anchor links
    addSmoothScrolling();
});

/**
 * Save subscriber information to localStorage
 * @param {string} name - Subscriber's name
 * @param {string} email - Subscriber's email
 */
function saveSubscriber(name, email) {
    // Get existing subscribers or initialize empty array
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    
    // Add new subscriber
    subscribers.push({
        name: name,
        email: email,
        date: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('subscribers', JSON.stringify(subscribers));
    
    // Log for debugging (would be removed in production)
    console.log('Subscriber saved:', name, email);
}

/**
 * Initialize Bootstrap tooltips
 */
function initTooltips() {
    // Check if Bootstrap tooltip function exists
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/**
 * Add smooth scrolling behavior to anchor links
 */
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Dynamically load episode data (could be used in a future version)
 * @param {string} url - URL to fetch episode data from
 */
function loadEpisodes(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Episodes loaded:', data);
            // Process and display episodes
        })
        .catch(error => {
            console.error('Error loading episodes:', error);
        });
}

// Add a class to animate elements when they come into view
// This could be expanded in the future
window.addEventListener('scroll', function() {
    // Implementation for scroll animations could go here
});