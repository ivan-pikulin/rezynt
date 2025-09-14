import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ga4Service } from '../services/ga4Service';

/**
 * Hook to automatically track page views when the route changes
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when location changes
    if (ga4Service.getIsInitialized()) {
      ga4Service.trackPageView(location.pathname + location.search);
    }
  }, [location]);
};

export default usePageTracking;
