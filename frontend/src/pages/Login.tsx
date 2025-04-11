import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './identity.css';
import '@fortawesome/fontawesome-free/css/all.css';
import Footer from '../components/Footer';
import FrontNavBar from '../components/FrontNavBar';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberme, setRememberme] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      setRememberme(checked);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleRegisterClick = () => {
    navigate('/create-account');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const loginUrl = rememberme
      ? `${API_BASE_URL}/login?useCookies=true`
      : `${API_BASE_URL}/login?useSessionCookies=true`;

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data = null;
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > 0) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Invalid email or password.');
      }

      navigate('/movie');
    } catch (error: any) {
      setError(error.message || 'Error logging in.');
      console.error('Fetch attempt failed:', error);
    }
  };

  return (
    <div className="centered-container">
      <FrontNavBar />
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Sign In</h5>
          <form onSubmit={handleSubmit}>
            <div className="form-floating">
              <input
                className="form-control"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
              />
              <label htmlFor="email">Email address</label>
            </div>
            <div className="form-floating">
              <input
                className="form-control"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
              />
              <label htmlFor="password">Password</label>
            </div>
            <div className="remember-me-container mb-3">
              <input
                type="checkbox"
                id="rememberme"
                name="rememberme"
                checked={rememberme}
                onChange={handleChange}
              />
              <label className="remember-me-text" htmlFor="rememberme">
                Remember password
              </label>
            </div>
            <div className="d-grid mb-2">
              <button className="btn-login" type="submit">
                Sign in
              </button>
            </div>
            <div className="d-grid mb-2">
              <button
                className="btn-outline-secondary"
                type="button"
                onClick={handleRegisterClick}
              >
                Register
              </button>
            </div>
            <hr className="my-4" />
            <div className="d-grid mb-2">
              <button
                className="btn-google"
                type="button"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/login-google`;
                }}
              >
                <i className="fa-brands fa-google me-2"></i> Sign in with Google
              </button>
            </div>
            <div className="d-grid mb-2">
              <button className="btn-facebook" type="button">
                <i className="fa-brands fa-facebook-f me-2"></i> Sign in with
                Facebook
              </button>
            </div>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;
