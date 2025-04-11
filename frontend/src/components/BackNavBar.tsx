import { Link, useNavigate } from 'react-router-dom';
import './BackNavBar.css';
import Logout from './Logout.tsx';
import { useEffect, useState } from 'react';
import AuthorizeView from './AuthorizeView';
import RequireRole from './RequireRole';

export default function NavBar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/movie" className="navbar-brand">
          CineNiche
        </Link>
      </div>
      <div className="navbar-right">
        {/* Always accessible links for both Admin and User */}
        <Link to="/movie" className="navbar-link">
          Home
        </Link>
        <Link to="/all-movies" className="navbar-link">
          All Movies
        </Link>
        <Link to="/profile" className="navbar-link">
          Movie Profile
        </Link>

        <Logout>
          <span className="navbar-logout">Logout</span>
        </Logout>
      </div>
    </nav>
  );
}
