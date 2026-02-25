import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface ProtectedActionProps {
  permission: string | string[]; // Permission(s) required to see the children
  children: ReactNode;
  /** Optionnel : ce qui s'affiche si pas la permission (défaut: rien) */
  fallback?: ReactNode;
  requiredAll?: boolean; // Si true, nécessite TOUTES les permissions listées (par défaut: au moins une)
}

/**
 * Cache son contenu si l'user n'a pas la permission requise.
 *
 * @example
 * <ProtectedAction permission="user.create">
 *   <Button>Créer</Button>
 * </ProtectedAction>
 *
 * <ProtectedAction permission="user.delete" fallback={<span>—</span>}>
 *   <Button variant="ghost"><Trash2 /></Button>
 * </ProtectedAction>
 */
export const ProtectedAction = ({
  permission,
  children,
  fallback = null,
  requiredAll = true,
}: ProtectedActionProps) => {
  const { can } = usePermissions();
  
  const hasAccess = Array.isArray(permission)
    ? requiredAll
      ? permission.every(p => can(p))  
      : permission.some(p => can(p))    
    : can(permission);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};