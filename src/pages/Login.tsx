import React, { useState } from 'react';
import { useRouter } from 'next/router';
import sqlite3 from 'sqlite3';
import { compareSync } from 'bcrypt';

const db = new sqlite3.Database('./database.sqlite');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  function handleLogin() {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      email,
      (error, user) => {
        if (error) {
          console.error(error);
          return;
        }

        if (user && compareSync(password, user.password)) {
          // Set the session cookie with the user's session ID
          document.cookie = `session_id=${user.session_id}`;

          // Redirect to the home page
          router.push('/');
        } else {
          console.error('Invalid email or password');
        }
      }
    );
  }

  return (
    <div>
      <h2>Login</h2>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
