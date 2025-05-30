import { ModuleDto } from '@/app/types/lessons';
import axios from 'axios';

export async function getAllModules(): Promise<{ modules: ModuleDto[] }> {
  const res = await axios.get('/api/modules', { withCredentials: true });
  return res.data;
}