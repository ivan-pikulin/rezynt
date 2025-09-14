import ReactGA from 'react-ga4';

class GA4Service {
  private measurementId: string | null = null;
  private isInitialized = false;

  /**
   * Initialize Google Analytics 4
   * @param measurementId - GA4 Measurement ID (e.g., G-XXXXXXXXXX)
   */
  initialize(measurementId: string): void {
    if (this.isInitialized || !measurementId) {
      return;
    }

    this.measurementId = measurementId;
    
    try {
      ReactGA.initialize(measurementId, {
        testMode: import.meta.env.DEV,
        gtagOptions: {
          linker: {
            domains: ['rezynt.com', 'app.rezynt.com']
          }
        }
      });
      
      this.isInitialized = true;
      console.log('GA4 initialized with measurement ID:', measurementId, 'and cross-domain tracking for rezynt.com and app.rezynt.com');
    } catch (error) {
      console.error('Failed to initialize GA4:', error);
    }
  }

  /**
   * Track page views
   * @param page - Page path (e.g., '/dashboard', '/resume/123')
   * @param title - Page title (optional)
   */
  trackPageView(page: string, title?: string): void {
    if (!this.isInitialized) {
      console.warn('GA4 not initialized. Cannot track page view.');
      return;
    }

    try {
      ReactGA.send({ hitType: 'pageview', page, title });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track custom events
   * @param eventName - Event name (e.g., 'button_click', 'form_submit')
   * @param parameters - Event parameters
   */
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('GA4 not initialized. Cannot track event.');
      return;
    }

    try {
      ReactGA.event(eventName, parameters);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track user login
   * @param method - Login method (e.g., 'email', 'google', 'github')
   */
  trackLogin(method: string): void {
    this.trackEvent('login', { method });
  }

  /**
   * Track user signup
   * @param method - Signup method (e.g., 'email', 'google', 'github')
   */
  trackSignUp(method: string): void {
    this.trackEvent('sign_up', { method });
  }

  /**
   * Track resume creation
   * @param source - Source of resume creation (e.g., 'upload', 'template', 'chat')
   */
  trackResumeCreate(source: string): void {
    this.trackEvent('resume_create', { source });
  }

  /**
   * Track resume export
   * @param format - Export format (e.g., 'pdf', 'docx')
   */
  trackResumeExport(format: string): void {
    this.trackEvent('resume_export', { format });
  }

  /**
   * Track chat interaction
   * @param action - Chat action (e.g., 'message_sent', 'suggestion_clicked')
   * @param additionalParams - Additional parameters
   */
  trackChatInteraction(action: string, additionalParams?: Record<string, any>): void {
    this.trackEvent('chat_interaction', { action, ...additionalParams });
  }

  /**
   * Set user properties
   * @param properties - User properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('GA4 not initialized. Cannot set user properties.');
      return;
    }

    try {
      ReactGA.set(properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Check if GA4 is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get measurement ID
   */
  getMeasurementId(): string | null {
    return this.measurementId;
  }
}

// Export singleton instance
export const ga4Service = new GA4Service();
export default ga4Service;
