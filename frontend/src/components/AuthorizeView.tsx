import React, { useState, useEffect, createContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'; // ✅ Add useNavigate

export const UserContext = createContext<User | null>(null);

interface User {
  email: string;
  roles: string[];
}

function AuthorizeView(props: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>({ email: '', roles: [] });

  const navigate = useNavigate(); // ✅ Now active

  useEffect(() => {
    async function fetchWithRetry(url: string, options: any) {
      try {
        const response = await fetch(url, options);

        // Check for 401 before trying to read JSON
        if (response.status === 401) {
          navigate('/login'); // 🔁 Manual redirect
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }

        const data = await response.json();

        if (data.email) {
          setUser({ email: data.email, roles: data.roles || [] });
          setAuthorized(true);
        } else {
          throw new Error('Invalid user session');
        }
      } catch (error) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    fetchWithRetry('https://localhost:5000/pingauth', {
      method: 'GET',
      credentials: 'include',
    });
  }, [navigate]); // include navigate in deps

  if (loading) {
    return <p>Loading...</p>;
  }

  if (authorized) {
    return (
      <UserContext.Provider value={user}>
        {props.children}
      </UserContext.Provider>
    );
  }

  // Don't return Navigate here anymore — handled in useEffect
  return null;
}

export function AuthorizedUser(props: { value: string }) {
  const user = React.useContext(UserContext);
  if (!user) return null;
  return props.value === 'email' ? <>{user.email}</> : null;
}

export default AuthorizeView;
