import { useQuery, useQueryClient } from '@tanstack/react-query';
import { resumeApi } from '../services/api';
import { Resume } from '../services/api/types';
import { guestResumeService } from '../services/guestResumeService';

export const useResumeQuery = (resumeId: string | null) => {
  const queryClient = useQueryClient();

  const isGuest = resumeId === 'guest';

  const {
    data: resume,
    isLoading,
    error,
    refetch
  } = useQuery<Resume>({
    queryKey: ['resume', resumeId],
    queryFn: () => {
      if (isGuest) {
        return Promise.resolve(guestResumeService.createOrGet());
      }
      return resumeApi.getResume(resumeId!);
    },
    enabled: !!resumeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Функция для принудительного обновления данных
  const refreshResume = async () => {
    if (!resumeId) return;
    if (isGuest) {
      // no-op for guest
      return;
    }
    await refetch();
  };

  // Функция для обновления данных резюме в кеше
  const updateResumeInCache = (updatedResume: Resume) => {
    if (!resumeId) return;
    if (isGuest) {
      guestResumeService.update(updatedResume);
    }
    queryClient.setQueryData(['resume', resumeId], updatedResume);
  };

  // Функция для инвалидации кеша
  const invalidateResume = () => {
    if (resumeId) {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    }
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
