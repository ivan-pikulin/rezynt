// Simple scroll animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll animation to elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.pain-item, .benefit-item, .corner-text, .central-illustration, .pricing-card, .hero-image, .solution, .process-subtitle');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // CTA button hover effects
    const ctaButtons = document.querySelectorAll('.cta-button, .plan-button, .pricing-cta');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Add click handler for pricing CTA button
        if (button.classList.contains('pricing-cta')) {
            button.addEventListener('click', function() {
                window.location.href = 'https://app.rezynt.com/start';
            });
        }
    });

    // Mock typing animation for chat messages
    const chatMessages = document.querySelectorAll('.message');
    chatMessages.forEach((message, index) => {
        message.style.opacity = '0';
        message.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            message.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Add loading state to CTA buttons
    const ctaLinks = document.querySelectorAll('a[href*="app.rezynt.com"]');
    ctaLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.opacity = '0.7';
            
            // Reset after a short delay (in case user comes back)
            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
            }, 2000);
        });
    });

    // Drop zone functionality
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.addEventListener('click', function() {
            // Redirect to app start page
            window.location.href = 'https://app.rezynt.com/start';
        });

        // Drag and drop handlers
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.background = '#f0f4ff';
            this.style.borderColor = '#5B6ACF';
        });

        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.background = '#fefefe';
            this.style.borderColor = '#8B7355';
        });

        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            // Redirect to app start page with uploaded file
            window.location.href = 'https://app.rezynt.com/start';
        });
    }
});

// Add some dynamic content updates
function updatePricingHighlight() {
    const featuredCard = document.querySelector('.pricing-card.featured');
    if (featuredCard) {
        // Add a subtle pulsing effect to the featured card
        setInterval(() => {
            featuredCard.style.boxShadow = '0 20px 40px rgba(91, 106, 207, 0.3)';
            setTimeout(() => {
                featuredCard.style.boxShadow = '0 10px 30px rgba(91, 106, 207, 0.2)';
            }, 1000);
        }, 3000);
    }
}

// Initialize dynamic effects
setTimeout(updatePricingHighlight, 1000);
