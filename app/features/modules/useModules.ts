import { useQuery } from '@tanstack/react-query';
import { getAllModules } from './api';

export function useModules() {
  return useQuery({ queryKey: ['modules'], queryFn: getAllModules });
}