import { useQuery, useQueryClient } from '@tanstack/react-query';
import { resumeApi } from '../services/api';
import { Resume } from '../services/api/types';
import { guestResumeService } from '../services/guestResumeService';
import { useAuth } from './useAuth';

export const useResumeQuery = (isGuest: boolean = false) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: resume,
    isLoading,
    error,
    refetch
  } = useQuery<Resume>({
    queryKey: ['resume', isGuest ? 'guest' : 'user'],
    queryFn: () => {
      if (isGuest) {
        return Promise.resolve(guestResumeService.createOrGet());
      }
      return resumeApi.getResume();
    },
    enabled: isGuest || isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Function to force data refresh
  const refreshResume = async () => {
    if (isGuest) {
      // no-op for guest
      return;
    }
    await refetch();
  };

  // Function to update resume data in cache
  const updateResumeInCache = (updatedResume: Resume) => {
    if (isGuest) {
      guestResumeService.update(updatedResume);
    }
    queryClient.setQueryData(['resume', isGuest ? 'guest' : 'user'], updatedResume);
  };

  // Function to invalidate cache
  const invalidateResume = () => {
    queryClient.invalidateQueries({ queryKey: ['resume', isGuest ? 'guest' : 'user'] });
  };

  return {
    resume,
    isLoading,
    error: error?.message || null,
    refreshResume,
    updateResumeInCache,
    invalidateResume
  };
};
