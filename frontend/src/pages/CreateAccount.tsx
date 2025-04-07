import { useState } from 'react';
import axios from 'axios';

export default function CreateAccount() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await axios.post('/api/auth/register', form);
    // Redirect to login or movie page
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Create an Account</h2>
      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
        className="input"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        className="input"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        className="input"
      />
      <button onClick={handleSubmit} className="btn-primary mt-4">
        Register
      </button>
    </div>
  );
}
