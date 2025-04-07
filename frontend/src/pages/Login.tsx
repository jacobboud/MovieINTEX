import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    await axios.post('/api/auth/login', form);
    // Store token + redirect
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Login</h2>
      <input
        name="email"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="input"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="input"
      />
      <button onClick={handleLogin} className="btn-primary mt-4">
        Login
      </button>
    </div>
  );
}
