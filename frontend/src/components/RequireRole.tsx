import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './AuthorizeView';

function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useContext(UserContext);

  if (!user) return <Navigate to="/login" />;
  const hasRole = user.roles.some(role => roles.includes(role));
  return hasRole ? children : <Navigate to="/movie" />;
}

export default RequireRole;
