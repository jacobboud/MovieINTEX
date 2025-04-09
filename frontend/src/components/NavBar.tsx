import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // You can modify this to fit your actual logout logic
    fetch('https://localhost:5000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => navigate('/login'))
      .catch((err) => console.error('Logout failed:', err));
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/movie" className="navbar-brand">
          CineNiche
        </Link>
      </div>
      <div className="navbar-right">
        <Link to="/all-movies" className="navbar-link">
          All Movies
        </Link>
        <Link to="/profile" className="navbar-link">
          Profile
        </Link>
        <button onClick={handleLogout} className="navbar-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
