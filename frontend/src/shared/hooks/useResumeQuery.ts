import { useQuery, useQueryClient } from '@tanstack/react-query';
import { resumeApi } from '../services/api';
import { Resume } from '../services/api/types';

export const useResumeQuery = (resumeId: string | null) => {
  const queryClient = useQueryClient();

  const {
    data: resume,
    isLoading,
    error,
    refetch
  } = useQuery<Resume>({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeApi.getResume(resumeId!),
    enabled: !!resumeId,
    staleTime: 5 * 60 * 1000, // 5 minutes - данные считаются свежими 5 минут
    gcTime: 10 * 60 * 1000, // 10 minutes - данные хранятся в кеше 10 минут
    refetchOnWindowFocus: false, // Не перезапрашиваем при фокусе окна
    refetchOnMount: false, // Не перезапрашиваем при монтировании, если данные есть в кеше
  });

  // Функция для принудительного обновления данных
  const refreshResume = async () => {
    if (resumeId) {
      await refetch();
    }
  };

  // Функция для обновления данных резюме в кеше
  const updateResumeInCache = (updatedResume: Resume) => {
    if (resumeId) {
      queryClient.setQueryData(['resume', resumeId], updatedResume);
    }
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
