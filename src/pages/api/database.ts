import type { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "database.sqlite");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { value, userId } = req.query;
  const db = new sqlite3.Database(dbPath);

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL
      );
      `,
    (error) => {
      if (error) {
        res.status(500).json({ message: "Error creating user table" });
      } else {
        res
          .status(200)
          .json({
            message: `Created user table`,
          });
      }
    }
  );

  db.close();
}
