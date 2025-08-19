import { useQuery } from '@tanstack/react-query';
import { resumeApi, ResumeApiResponse } from '../resumeApi';

export const useResumes = () => {
  const {
    data: resumes,
    isLoading,
    error,
    refetch
  } = useQuery<ResumeApiResponse[]>({
    queryKey: ['resumes'],
    queryFn: resumeApi.getAllResumes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
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
  } = useQuery<ResumeApiResponse>({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeApi.getResume(resumeId),
    enabled: !!resumeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    resume,
    isLoading,
    error: error?.message || null,
    refetch
  };
};
