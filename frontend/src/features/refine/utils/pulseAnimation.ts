/**
 * Universal pulse animation for buttons
 * Used to draw attention to add buttons throughout the editor
 */
export const pulseElement = (element: HTMLElement) => {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  setTimeout(() => {
    // Save original styles
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;
    
    element.style.transition = 'transform 0.3s ease-in-out';
    
    // Pulse animation: 1 → 1.1 → 1 → 1.1 → 1
    // First pulse
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
      
      // Second pulse
      setTimeout(() => {
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          
          // Clean up - restore original styles
          setTimeout(() => {
            element.style.transform = originalTransform;
            element.style.transition = originalTransition;
          }, 300);
        }, 300);
      }, 300);
    }, 300);
  }, 500);
};


