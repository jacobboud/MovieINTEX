import { Link } from 'react-router-dom';
import './FrontNavBar.css';

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          CineNiche
        </Link>
      </div>
      <div className="navbar-right">
        <Link to="/" className="navbar-link">
          Home
        </Link>
        <Link to="/privacy" className="navbar-link">
          Privacy Page
        </Link>
        <Link to="/Login" className="navbar-link">
          Login
        </Link>
      </div>
    </nav>
  );
}
