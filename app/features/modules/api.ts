import { ModuleDto } from '@/app/types/api/moduleTypes';
import axiosInstance from '@/app/utils/axiosRefreshTokenInstance';

export async function getAllModules(): Promise<{ modules: ModuleDto[] }> {
  const res = await axiosInstance.get<{ modules: ModuleDto[] }>('/api/modules');
  return res.data;
}