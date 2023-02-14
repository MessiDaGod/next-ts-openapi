import type { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, 'database.sqlite');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { value, userId } = req.query;

  const db = new sqlite3.Database(dbPath);

  db.run(`
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY,
      userId INTEGER NULL,
      value TEXT NULL
    )
  `);

  const tableName = 'connections';
  const valueToInsert = value ? value.toString() : value;

  db.run(`
    INSERT OR IGNORE INTO ${tableName} (value, userId)
    VALUES ($value, $userId)
  `, {
    $value: valueToInsert,
    $userId: userId,
  }, (error) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Error inserting value into table' });
    } else {
      console.info(`Value ${valueToInsert} inserted into table ${tableName}`);
      res.status(200).json({ message: 'Value inserted into table' });
    }
  });

//   db.run(
//     `UPDATE myTable SET selected_item = ? WHERE id = ?`,
//     [valueToInsert, 1],
//     (error) => {
//       if (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error updating database record' });
//       } else {
//         console.info("Database record updated successfully");
//         res.status(200).json({ message: 'Database record updated' });
//       }
//       db.close();
//     }
//   );
}
