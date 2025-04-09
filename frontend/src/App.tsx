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
import RequireRole from './components/RequireRole';
import AuthorizeView from './components/AuthorizeView';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const location = useLocation();
  const showWelcomeMessage = location.pathname === '/';

  return (
    <div>
      {showWelcomeMessage && (
        <div className="text-center p-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to CineNiche</h1>
          <p className="mb-6">Your curated hub for niche movies & shows</p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/create-account" className="btn-secondary">Create Account</Link>
            <Link to="/movie" className="btn-primary">Movie Page</Link>
          </div>
          <footer className="text-center mt-5 mb-3">
            <Link to="/privacy" className="text-decoration-none text-muted">Privacy Policy</Link>
          </footer>
        </div>
      )}

      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* 🔐 PROTECTED ROUTES ONLY */}
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
      </Routes>

    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      
        <App />
        
    </Router>
  );
}

export default AppWrapper;
