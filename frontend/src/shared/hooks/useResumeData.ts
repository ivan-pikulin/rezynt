import { useState, useEffect, useCallback } from 'react';
import { Resume } from '../services/api/types';
import { resumeApi } from '../services/api';
import { resumeCacheService } from '../services/resumeCacheService';

export const useResumeData = (resumeId: string | null) => {
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResume = useCallback(async (forceRefresh = false) => {
    console.log('📄 [useResumeData] fetchResume called:', {
      resumeId,
      forceRefresh,
      timestamp: new Date().toISOString()
    });

    if (!resumeId) {
      console.log('📄 [useResumeData] No resumeId provided, clearing data');
      setResumeData(null);
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = resumeCacheService.get(resumeId);
      console.log('📄 [useResumeData] Cache check:', {
        resumeId,
        cached: !!cachedData,
        templateId: cachedData?.template_id,
        templateSlug: cachedData?.template_slug
      });
      
      if (cachedData) {
        console.log('📄 [useResumeData] Using cached data:', {
          resumeId: cachedData.id,
          title: cachedData.title,
          templateId: cachedData.template_id,
          templateSlug: cachedData.template_slug
        });
        setResumeData(cachedData);
        return;
      }
    }

    console.log('📄 [useResumeData] Fetching resume from API:', resumeId);
    setIsLoading(true);
    setError(null);

    try {
      const data = await resumeApi.getResume(resumeId);
      console.log('📄 [useResumeData] Resume fetched successfully:', {
        resumeId: data.id,
        title: data.title,
        templateId: data.template_id,
        templateSlug: data.template_slug,
        hasTemplateId: !!data.template_id,
        hasTemplateSlug: !!data.template_slug
      });
      
      // Store in cache
      resumeCacheService.set(resumeId, data);
      console.log('📄 [useResumeData] Resume cached successfully');
      
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
    console.log('📄 [useResumeData] Initial fetch effect triggered');
    fetchResume();
  }, [fetchResume]);

  // Refresh resume data (e.g., after AI response)
  const refreshResume = useCallback(() => {
    console.log('📄 [useResumeData] refreshResume called:', { resumeId });
    if (resumeId) {
      console.log('📄 [useResumeData] Invalidating cache and fetching fresh data');
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
