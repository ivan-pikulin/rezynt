import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { yandexMetrikaService } from '../services/yandexMetrikaService';

/**
 * Hook to automatically track page views when the route changes
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    yandexMetrikaService.trackPageView(location.pathname + location.search, document.title);
  }, [location]);
};

export default usePageTracking;
