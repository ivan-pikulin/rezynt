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
    enabled: !shouldShowOnboarding, // Не делаем запрос если пользователь в онбординге
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    resumes,
    isLoading: shouldShowOnboarding ? false : isLoading, // Не показываем загрузку если в онбординге
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
