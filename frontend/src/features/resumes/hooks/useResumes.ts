import { useQuery } from '@tanstack/react-query';
import { resumeApi } from '../../../shared/services/api';
import { Resume } from '../../../shared/services/api/types';
import { useAuthContext } from '../../../shared/contexts/AuthContext';
import { useOnboarding } from '../../../shared/hooks/useOnboarding';

export const useResumes = () => {
  const { user } = useAuthContext();
  const { shouldShowOnboarding } = useOnboarding(user);
  
  const {
    data: resumes,
    isLoading,
    error,
    refetch
  } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => resumeApi.getUserResumes(),
    enabled: !shouldShowOnboarding, // Don't make request if user is in onboarding
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    resumes,
    isLoading: shouldShowOnboarding ? false : isLoading, // Don't show loading if in onboarding
    error: error?.message || null,
    refetch
  };
};

export const useResume = (resumeId: string) => {
  const {
    data: resume,
    isLoading,
    error,
    refetch
  } = useQuery<Resume>({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeApi.getResume(resumeId),
    enabled: !!resumeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    resume,
    isLoading,
    error: error?.message || null,
    refetch
  };
};
