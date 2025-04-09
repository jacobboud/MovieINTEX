import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import LoginPage from './pages/Login';
import CreateAccountPage from './pages/CreateAccount';
import MoviePage from './pages/MoviePage';
import PrivacyPage from './pages/Privacy';
import ManageMovies from './pages/ManageMovies';
import NewUserForm from './pages/NewUserForm';
/*Imports bootstrap*/
//import 'bootstrap/dist/css/bootstrap.min.css';

import { useEffect } from 'react';

function App() {
  const location = useLocation(); // This hook now works correctly because of Router

  // Only show the welcome message on the home page (/)
  const showWelcomeMessage = location.pathname === '/';

  useEffect(() => {
    // Add or remove the 'home-page' class depending on the route
    if (location.pathname === '/') {
      document.body.classList.add('home-page');
      document.body.classList.remove('default-background');
    } else {
      document.body.classList.add('default-background');
      document.body.classList.remove('home-page');
    }
  }, [location]);

  return (
    <div className="body">
      {/* Conditionally render the welcome message only on the home page */}
      {showWelcomeMessage && (
        <div className="word">
          <h1 className="text-4xl font-bold mb-4">Welcome to CineNiche</h1>
          <p className="mb-6">Your curated hub for niche movies & shows</p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          </div>
          <div>
            <Link to="/create-account" className="btn-secondary">
              Create Account
            </Link>
          </div>

          {/* Fixed footer */}
          <footer className="footer-fixed">
            <h6>
              CineNiche--
              <Link to="/privacy" className="footer-link">
                Privacy Policy
              </Link>
            </h6>
          </footer>
        </div>
      )}

      {/* Define the routes for the pages */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/manage-movies" element={<ManageMovies />} />
        <Route path="/new-user" element={<NewUserForm />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App /> {/* Wrap App component with Router */}
    </Router>
  );
}

export default AppWrapper;
