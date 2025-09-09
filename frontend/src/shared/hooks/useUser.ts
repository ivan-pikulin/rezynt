import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/api/userApi';
import { User } from '../services/api/types';
import { tokenService } from '../services/api/tokenService';

export const useUser = () => {
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => userApi.getCurrentUser(),
    enabled: !!tokenService.getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    user,
    isLoading,
    error: error?.message || null,
    refetch
  };
};
