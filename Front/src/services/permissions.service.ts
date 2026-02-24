import api from '@/lib/api';
import { Permission } from '@/types/roles.types';

export interface CreatePermissionDto {
  name: string;
  description?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
}

export const permissionsService = {
  findAll: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions');
    return response.data;
  },

  findOne: async (id: number): Promise<Permission> => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  create: async (dto: CreatePermissionDto): Promise<Permission> => {
    const response = await api.post('/permissions', dto);
    return response.data;
  },

  update: async (id: number, dto: UpdatePermissionDto): Promise<Permission> => {
    const response = await api.patch(`/permissions/${id}`, dto);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/permissions/${id}`);
  },
};