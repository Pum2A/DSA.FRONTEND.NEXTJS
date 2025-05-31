import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, loginUser, logoutUser, registerUser } from './api';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      // After login, refetch user data
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerUser
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: getMe });
}