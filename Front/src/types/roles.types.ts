export interface Permission {
  id: number;
  name: string; // ex: "user.create"
  description: string | null;
}

export interface Role {
  id: number;
  name: string;
  createdAt: string;
  permissions: Permission[];
}

export interface RolesApiResponse {
  status: number;
  message: string;
  response: Role[];
}