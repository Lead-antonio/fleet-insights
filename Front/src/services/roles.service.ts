import api from '@/lib/api';
import { RolesApiResponse } from '@/types/roles.types';

export interface CreateRoleDto {
  name: string;
  permissionIds?: number[];
}

export interface UpdateRoleDto {
  name?: string;
  permissionIds?: number[];
}

export const rolesService = {
  findAll: async (): Promise<RolesApiResponse> => {
    const response = await api.get('/roles');
    return response.data;
  },

  create: async (dto: CreateRoleDto): Promise<RolesApiResponse> => {
    const response = await api.post('/roles', dto);
    return response.data;
  },

  update: async (id: number, dto: UpdateRoleDto): Promise<RolesApiResponse> => {
    const response = await api.patch(`/roles/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};