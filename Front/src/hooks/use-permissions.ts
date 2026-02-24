import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions: string[] =
    user?.role?.permissions?.map((p: any) => p.name) ?? [];

  const isAdmin = user?.role?.name === 'Administrateur';

  /** Vérifie si l'user a UNE permission précise — ex: "user.create" */
  const can = (permission: string): boolean => {
    if (isAdmin) return true;
    return permissions.includes(permission);
  };

  /** Vérifie si l'user a AU MOINS UNE des permissions listées */
  const canAny = (...perms: string[]): boolean => {
    if (isAdmin) return true;
    return perms.some((p) => permissions.includes(p));
  };

  /** Vérifie si l'user a TOUTES les permissions listées */
  const canAll = (...perms: string[]): boolean => {
    if (isAdmin) return true;
    return perms.every((p) => permissions.includes(p));
  };

  return { can, canAny, canAll, permissions, isAdmin };
};