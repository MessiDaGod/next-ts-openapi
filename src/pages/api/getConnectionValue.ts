import type { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "database.sqlite");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = new sqlite3.Database(dbPath);

  db.get(
    `SELECT value FROM connections WHERE userId = 1`,
    (error, row) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting value from table" });
      } else {
        const value = row ? row.value : null;
        res.status(200).json({ value });
      }
    }
  );

  db.close();
}
