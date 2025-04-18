import React, { useState, useEffect, createContext } from 'react';
import { Navigate } from 'react-router-dom';

export const UserContext = createContext<User | null>(null);

interface User {
  email: string;
  roles: string[];
}

function AuthorizeView(props: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>({ email: '', roles: [] });

  useEffect(() => {
    // ⏱ Wait 300ms before starting fetch
    const timer = setTimeout(() => {
      fetch('https://localhost:5000/pingauth', {
        method: 'GET',
        credentials: 'include',
      })
        .then(async (res) => {
          if (res.status === 401) {
            throw new Error('Unauthorized');
          }
          const data = await res.json();
          if (data.email) {
            setUser({ email: data.email, roles: data.roles || [] });
            setAuthorized(true);
          } else {
            throw new Error('No valid user data');
          }
        })
        .catch(() => {
          setAuthorized(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200); // <-- 👈 actual delay

    return () => clearTimeout(timer); // cleanup
  }, []);

  if (loading) return <p>Loading...</p>;

  if (authorized) {
    return (
      <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
    );
  }

  return <Navigate to="/login" />;
}

// hello world

export function AuthorizedUser(props: { value: string }) {
  const user = React.useContext(UserContext);
  if (!user) return null;
  return props.value === 'email' ? <>{user.email}</> : null;
}

export default AuthorizeView;
// Note: This component is used to wrap around routes that require authentication.
// It checks if the user is authorized and provides the user context to its children.
// If the user is not authorized, it redirects them to the login page.
