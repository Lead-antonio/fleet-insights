import api from '@/lib/api';
import { RolesApiResponse } from '@/types/roles.types';

export const rolesService = {
  findAll: async (): Promise<RolesApiResponse> => {
    const response = await api.get('/roles');
    return response.data;
  },
};