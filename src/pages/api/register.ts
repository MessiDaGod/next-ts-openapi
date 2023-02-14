import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Session } from "next-iron-session";
import withSession from "../session";

const saltRounds = 10;
const dbPath = "./database.sqlite";

// Initialize the database
async function initializeDb() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT
    );
    CREATE NONCLUSTERED INDEX IF NOT EXISTS idx_users ON users (username);
  `);

  return db;
}

// Register a new user
async function registerUser(username: string, password: string) {

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  if (username == null || password == null) return 0;

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  const alreadyExists = await db.get(
    "SELECT * FROM users WHERE username = ?",
    username
  );

  if (alreadyExists) {
    await db.close();
    return 0;
  }

  const result = await db.run(
    `INSERT INTO users (username, password) VALUES ($userName, $password)`,
     {
       $userName: username,
       $password: hashedPassword,
     },
  );
  const userId = result.lastID;
  await db.close();
  return userId;
}

// Log in a user and create a session
async function loginUser(
  username: string,
  password: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await initializeDb();
  const result = await db.get(
    "SELECT * FROM users WHERE username = ?",
    username
  );
  await db.close();

  if (result) {
    const passwordMatch = await bcrypt.compare(password, result.password);
    if (passwordMatch) {
      const session = (await req.session) as Session;
      session.set("user", { id: result.id, username: result.username });
      await session.save();
      return true;
    }
  }

  return false;
}

// Handler for the register API endpoint
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const searchParams = new URLSearchParams(req.url?.split("?")[1]);
  let username: string | null = null;
  let password: string | null = null;
  username = searchParams.get("username");
  password = searchParams.get("password");
  if (username !== null && password !== null) {

     const userId = await registerUser(username, password);
     res.status(200).json({ userId });
  }
}

// Handler for the login API endpoint
export async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  const { username, password } = req.body;
  const loginSuccess = await loginUser(username, password, req, res);
  if (loginSuccess) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
}
