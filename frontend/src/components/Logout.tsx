import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function Logout(props: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigate('/login');
      } else {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <a className="logout" href="#" onClick={handleLogout}>
      {props.children}
    </a>
  );
}

export default Logout;
