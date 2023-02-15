import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const saltRounds = 10;
const dbPath = "./database.sqlite";

// Initialize the database
async function initializeDb() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.run(`
  CREATE TABLE IF NOT EXISTS Users (
    Id		integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    Version		integer NULL,
    Email		nvarchar COLLATE NOCASE,
    Password		varchar COLLATE NOCASE,
    Username		varchar COLLATE NOCASE,
    Name nvarchar(450) NULL COLLATE NOCASE,
    ClaimsJson nvarchar NULL COLLATE NOCASE
  );
    CREATE NONCLUSTERED INDEX IF NOT EXISTS idx_users ON users (Username);
  `);

  return db;
}

// Register a new user
async function registerUser(name: string, email: string, username: string, password: string) {

  const encoded = encodeURIComponent(`${name}&email=${email}&plainUsername=${username}&plainPassword=${password}`);
  let url = `https://localhost:5006/api/auth/DoRegister?name=${encoded}`;
  const response = await fetch(url, {
    method: 'POST'
  });
  const data = await response.text();
  console.log(data);

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

// Handler for the register API endpoint
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const searchParams = new URLSearchParams(req.url?.split("?")[1]);
  let name: string | null = null;
  let email: string | null = null;
  let username: string | null = null;
  let password: string | null = null;
  name = searchParams.get("name");
  email = searchParams.get("email");
  username = searchParams.get("username");
  password = searchParams.get("password");
  if (username !== null && password !== null && name !== null && email !== null) {
     await initializeDb();
     const userId = await registerUser(name, email, username, password);
     res.status(200).json({ userId });
  }
}