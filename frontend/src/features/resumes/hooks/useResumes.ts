import { useQuery } from '@tanstack/react-query';
import { resumeApi } from '../../../shared/services/api';
import { Resume } from '../../../shared/services/api/types';

export const useResumes = () => {
  const {
    data: resumes,
    isLoading,
    error,
    refetch
  } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => resumeApi.getUserResumes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    resumes,
    isLoading,
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
