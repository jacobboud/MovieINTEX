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
import 'bootstrap/dist/css/bootstrap.min.css';
import NewUserForm from './pages/NewUserForm';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';   // Used for redirecting when needed.

function App() {
  const location = useLocation(); // This hook now works correctly because of Router

  // Only show the welcome message on the home page (/)
  const showWelcomeMessage = location.pathname === '/';


  // const navigate = useNavigate();     Used for redirecting when needed.
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     // You can check for a cookie, token, or use your own backend endpoint
  //     const response = await fetch('https://localhost:5000/auth-status', {
  //       credentials: 'include' // include cookies if you're using Identity
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.isAuthenticated) {
  //         navigate('/movie'); // ✅ Redirect if logged in
  //       }
  //       else{
  //         // alert('You are not logged in. Please log in to continue.');
  //       }
  //     }
  //   };

  //   checkAuth();
  // }, [navigate]);

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
