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
import AllMovies from './pages/AllMovies';
import RequireRole from './components/RequireRole';
import AuthorizeView from './components/AuthorizeView';
/*Imports bootstrap*/
//import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import ProfilePage from './pages/ProfilePage';
import MovieDetail from './components/MovieDetail';

import Footer from './components/Footer';
import FrontNavBar from './components/FrontNavBar';

import CookieBanner from './components/CookieBanner';
import ThemePreference from './components/ThemePreference';
import GoogleAnalyticsLoader from './components/GoogleAnalyticsLoader';

function App() {
  const location = useLocation(); // This hook now works correctly because of Router
  const isHomePage = location.pathname === '/';
  // Only show the welcome message on the home page (/)
  const showWelcomeMessage = location.pathname === '/';

  useEffect(() => {
    // Add or remove the 'home-page' class depending on the route
    if (location.pathname === '/') {
      document.body.classList.add('home-page', 'fullscreen-overlay');
      document.body.classList.remove('default-background');
    } else {
      document.body.classList.add('default-background');
      document.body.classList.remove('home-page', 'fullscreen-overlay');
    }
  }, [location]);

  return (
    <div className="body">
      {isHomePage && <div className="fullscreen-overlay"></div>}
      <FrontNavBar />
      {/* Conditionally render the welcome message only on the home page */}
      {showWelcomeMessage && (
        <div className="welcome-container">
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

            <Footer />
          </div>
        </div>
      )}

      {/* Define the routes for the pages */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/movie/:showId" element={<MovieDetail />} />

        <Route
          path="/movie"
          element={
            <AuthorizeView>
              <RequireRole roles={['User', 'Admin']}>
                <MoviePage />
              </RequireRole>
            </AuthorizeView>
          }
        />

        <Route
          path="/movie/:showId"
          element={
            <AuthorizeView>
              <RequireRole roles={['User', 'Admin']}>
                <MovieDetail />
              </RequireRole>
            </AuthorizeView>
          }
        />

        <Route
          path="/manage-movies"
          element={
            <AuthorizeView>
              <RequireRole roles={['Admin']}>
                <ManageMovies />
              </RequireRole>
            </AuthorizeView>
          }
        />

        <Route
          path="/new-user"
          element={
            <AuthorizeView>
              <NewUserForm />
            </AuthorizeView>
          }
        />

        <Route path="/unauthorized" element={<h1>403 – Unauthorized</h1>} />

        <Route
          path="/all-movies"
          element={
            <AuthorizeView>
              <RequireRole roles={['User', 'Admin']}>
                <AllMovies />
              </RequireRole>
            </AuthorizeView>
          }
        />

        <Route
          path="/profile"
          element={
            <AuthorizeView>
              <RequireRole roles={['User', 'Admin']}>
                <ProfilePage />
              </RequireRole>
            </AuthorizeView>
          }
        />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <CookieBanner />
      <ThemePreference />
      <GoogleAnalyticsLoader />
      <App /> {/* Wrap App component with Router */}
    </Router>
  );
}

export default AppWrapper;
