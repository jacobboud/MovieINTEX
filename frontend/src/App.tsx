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

function App() {
  const location = useLocation(); // This hook now works correctly because of Router

  // Only show the welcome message on the home page (/)
  const showWelcomeMessage = location.pathname === '/';

  return (
    <div>
      {/* Conditionally render the welcome message only on the home page */}
      {showWelcomeMessage && (
        <div className="text-center p-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to CineNiche</h1>
          <p className="mb-6">Your curated hub for niche movies & shows</p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
            <Link to="/create-account" className="btn-secondary">
              Create Account
            </Link>
            <Link to="/movie" className="btn-primary">
              Movie Page
            </Link>
          </div>
          <footer className="text-center mt-5 mb-3">
            <Link to="/privacy" className="text-decoration-none text-muted">
              Privacy Policy
            </Link>
          </footer>
        </div>
      )}

      {/* Define the routes for the pages */}
      <Routes>
        {/*<Route path="/" element={<h1>Home Page</h1>} />{' '}*/}
        {/* Default home route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
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
