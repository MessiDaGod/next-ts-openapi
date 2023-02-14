import type { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "database.sqlite");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { value, userId } = req.query;
  const tableName = "connections";
  const valueToInsert = value ? value.toString() : value;
  const db = new sqlite3.Database(dbPath);

  db.run(
    `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY,
      userId INTEGER NULL UNIQUE,
      value TEXT NULL UNIQUE
    )
  `,
    (error) => {
      if (error) {
        res.status(500).json({ message: "Error inserting value into table" });
      } else {
        db.run(
          `
          INSERT INTO ${tableName} (value, userId)
          VALUES ($value, $userId)
          ON CONFLICT(userId)
          DO UPDATE SET value = excluded.value
        `,
          {
            $value: valueToInsert,
            $userId: userId,
          },
          (error) => {
            if (error) {
              res.status(500).json({ message: "Error inserting value into table" });
            } else {
              console.info(
                `Value ${valueToInsert} inserted or updated in ${tableName} table`
              );
              res
                .status(200)
                .json({
                  message: `Value ${valueToInsert} inserted or updated in ${tableName} table`,
                });
            }
            db.close();
          }
        );
      }
      db.close();
    }
  );
}
