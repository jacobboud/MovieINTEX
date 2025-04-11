import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './identity.css';
import '@fortawesome/fontawesome-free/css/all.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '../components/Footer';
import FrontNavBar from '../components/FrontNavBar';

function LoginPage() {
  // state variables for email and passwords
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberme, setRememberme] = useState<boolean>(false);

  // state variable for error messages
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // handle change events for input fields
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

  // handle submit event for the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const loginUrl = rememberme
      ? 'https://localhost:5000/login?useCookies=true'
      : 'https://localhost:5000/login?useSessionCookies=true';

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include', // ✅ Ensures cookies are sent & received
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Ensure we only parse JSON if there is content
      let data = null;
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > 0) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Invalid email or password.');
      }

      navigate('/movie'); // Redirect to the movie page on successful login
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
                      value=""
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
                      onClick={handleRegisterClick}
                  >
                      Register
                  </button>
              </div>
              <hr className="my-4" />
              <div className="d-grid mb-2">
                  <button className="btn-google" type="button" 
                          onClick={() => {window.location.href = 'https://localhost:5000/login-google';}}  >
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