import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface ProtectedActionProps {
  permission: string;
  children: ReactNode;
  /** Optionnel : ce qui s'affiche si pas la permission (défaut: rien) */
  fallback?: ReactNode;
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
}: ProtectedActionProps) => {
  const { can } = usePermissions();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
};