'use client';

import React, { useState } from 'react';
import { loginUser } from '@/lib/api';  // Call the login function instead of createUser

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginUser(username, password);  // Call login API
      setMessage(`Welcome, ${result.username}!`);
      // Optionally store the token in local storage or state
      localStorage.setItem('authToken', result.token);
    } catch (error) {
      setMessage('Invalid credentials or error during login');
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 mb-2 block"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2 block"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
