import type { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function run() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  return db;
}

run();

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const db = await run();
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user || user.password !== password) {
      res.status(401).json({ message: 'Invalid email or password' });
    } else {
      req.session.user = user;
      res.status(200).json({ message: 'Login successful' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
