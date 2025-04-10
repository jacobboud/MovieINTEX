import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CreateAccount.css';
import Footer from '../components/Footer';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState(''); // ✅ New state
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginClick = () => navigate('/login');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !name ||
      !age ||
      !gender ||
      !city ||
      !stateVal ||
      !zip ||
      !phone
    ) {
      setError('Please fill in all fields.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
    } else {
      setError('');
      fetch('https://localhost:5000/custom-register', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          age: parseInt(age),
          gender,
          city,
          state: stateVal,
          zip,
          phone, // ✅ Included in request
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || 'Registration failed');
          }
          // after successful registration or login:
          window.location.href = '/profile';
        })
        .catch((error) => {
          const errorMessage = error.message || 'Error registering.';
          console.error('Frontend error:', errorMessage);
          setError('Error registering.');
        });
    }
  };

  return (
    <>
      <div className="create-account-card">
        <div className="create-account-body">
          <div className="card-body p-4 p-sm-5">
            <h1 className="create-account-heading">Create Account</h1>
            {/* <h5 className="card-title text-center mb-5 fw-light fs-5">
                Register
              </h5> */}
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="name">Full Name</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                <label htmlFor="age">Age</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
                <label htmlFor="gender">Gender</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <label htmlFor="city">City</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="state"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                />
                <label htmlFor="state">State</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
                <label htmlFor="zip">Zip</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <label htmlFor="phone">Phone Number</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="email">Email address</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="password">Password</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>
              <div className="d-grid mb-2">
                <button className="btn btn-primary btn-login" type="submit">
                  Register
                </button>
              </div>
              <div className="d-grid mb-2">
                <button
                  className="btn btn-go-login btn-login"
                  type="button"
                  onClick={handleLoginClick}
                >
                  Go to Login
                </button>
              </div>
              <br></br>
              <br></br>
              <div className="d-grid mb-2">
                <button
                  className="btn-google"
                  type="button"
                  onClick={() => {
                    window.location.href =
                      'https://localhost:5000/login-google';
                  }}
                >
                  <i className="fa-brands fa-google me-2"></i> Sign in with
                  Google
                </button>
              </div>
              <div className="d-grid mb-2">
                <button className="btn-facebook" type="button">
                  <i className="fa-brands fa-facebook-f me-2"></i> Sign in with
                  Facebook
                </button>
              </div>
            </form>
            <strong>{error && <p className="error">{error}</p>}</strong>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Register;
