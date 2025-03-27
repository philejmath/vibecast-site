// Main JavaScript for Vibcast Website

document.addEventListener('DOMContentLoaded', function() {
    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');
    const signupSuccess = document.getElementById('signup-success');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, you would send this data to a server
            // For GitHub Pages, we'll just simulate a successful submission
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            // Store in localStorage for demo purposes
            const subscribers = JSON.parse(localStorage.getItem('vibcast-subscribers') || '[]');
            subscribers.push({
                name: name,
                email: email,
                date: new Date().toISOString()
            });
            localStorage.setItem('vibcast-subscribers', JSON.stringify(subscribers));
            
            // Show success message
            signupForm.reset();
            signupSuccess.classList.remove('d-none');
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                signupSuccess.classList.add('d-none');
            }, 5000);
            
            // Update counter if it exists
            const counter = document.getElementById('subscriber-count');
            if (counter) {
                counter.textContent = subscribers.length;
            }
        });
    }
    
    // Update subscriber count on page load
    const counter = document.getElementById('subscriber-count');
    if (counter) {
        const subscribers = JSON.parse(localStorage.getItem('vibcast-subscribers') || '[]');
        counter.textContent = subscribers.length;
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;
            
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation classes to elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('fade-in');
            }
        });
    };
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Run once on page load
    animateOnScroll();
});
