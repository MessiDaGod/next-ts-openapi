import React, { useState } from 'react';
import { useRouter } from 'next/router';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { NextApiRequest, NextApiResponse } from 'next';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';

// Create a session store using SQLite
const SQLiteStore = connectSqlite3(session);
const sessionStore = new SQLiteStore({ db: 'sessions.sqlite' });

// Open the SQLite database
const dbPromise = open({ filename: 'database.sqlite', driver: sqlite3.Database });

// Register component
export const Register: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const db = await dbPromise;

    // Check if the user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE username = ?', username);
    if (existingUser) {
      alert('Username already exists!');
      return;
    }

    // Create a new user record
    const { lastID } = await db.run('INSERT INTO users (username, password) VALUES (?, ?)', username, password);
    console.log(`User ${username} registered with ID ${lastID}`);

    // Initialize a session
    const sessionId = Math.random().toString(36).substring(7);
    const sessionData = { username };
    const sessionExpirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    const sessionOptions = { store: sessionStore, id: sessionId, cookie: { expires: sessionExpirationDate } };
    const sessionMiddleware = session(sessionOptions);
    const req: NextApiRequest = { session: sessionMiddleware } as NextApiRequest;
    const res: NextApiResponse = {} as NextApiResponse;
    await new Promise((resolve, reject) => {
      sessionMiddleware(req, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    req.session!.data = sessionData;
    await new Promise((resolve, reject) => {
      req.session!.save((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    console.log(`Session ${sessionId} created for user ${username}`);

    // Redirect to the dashboard
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <button type="submit">Register</button>
    </form>
  );
};

// Login component
export
