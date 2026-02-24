import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';

interface ProtectedPageProps {
  permission: string;
  children: ReactNode;
  /** Page vers laquelle rediriger si pas la permission (défaut: "/") */
  redirectTo?: string;
}

/**
 * Redirige automatiquement si l'user n'a pas la permission d'accéder à la page.
 * L'ADMIN bypass toutes les restrictions.
 *
 * @example
 * <Route
 *   path="/users"
 *   element={
 *     <ProtectedPage permission="user.read" redirectTo="/dashboard">
 *       <UsersPage />
 *     </ProtectedPage>
 *   }
 * />
 */
export const ProtectedPage = ({
  permission,
  children,
  redirectTo = '/',
}: ProtectedPageProps) => {
  const { can, isAdmin } = usePermissions();
  const navigate = useNavigate();
  const hasAccess = isAdmin || can(permission);

  useEffect(() => {
    if (!hasAccess) {
      navigate(redirectTo, { replace: true });
    }
  }, [hasAccess, redirectTo, navigate]);

  if (!hasAccess) return null;
  return <>{children}</>;
};