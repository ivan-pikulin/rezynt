import { useState, useEffect, useCallback } from 'react';
import { Resume } from '../services/api/types';
import { resumeApi } from '../services/api';
import { resumeCacheService } from '../services/resumeCacheService';

export const useResumeData = (resumeId: string | null) => {
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResume = useCallback(async (forceRefresh = false) => {
    if (!resumeId) {
      setResumeData(null);
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = resumeCacheService.get(resumeId);
      
      if (cachedData) {
        setResumeData(cachedData);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await resumeApi.getResume();
      
      // Store in cache
      resumeCacheService.set(resumeId, data);
      
      setResumeData(data);
    } catch (err) {
      console.error('📄 [useResumeData] Error fetching resume:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch resume');
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  // Initial fetch
  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  // Refresh resume data (e.g., after AI response)
  const refreshResume = useCallback(() => {
    if (resumeId) {
      // Invalidate cache and fetch fresh data
      resumeCacheService.invalidate(resumeId);
      fetchResume(true);
    }
  }, [resumeId, fetchResume]);

  return {
    resumeData,
    isLoading,
    error,
    refreshResume,
    fetchResume
  };
};
