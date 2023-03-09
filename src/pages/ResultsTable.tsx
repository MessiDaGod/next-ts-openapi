import { Payable } from "./dataStructure";
import useBinaryFile from "./useBinaryFile";
import { useDB, useDBQuery } from "./useDB";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { useState } from "react";
import Script from "next/script";

export function ResultTable() {
  const data = useBinaryFile("database.sqlite");
  const db = useDB(data);
  const [query, setQuery] = useState(
    "SELECT name FROM  sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';"
  );
  const results = useDBQuery(db, query);

  return (
    <><Script type="module" strategy='beforeInteractive' src="/sql-loader.js" /><table className="w-full">
          <thead>
              <tr>
                  {results[0].columns.map((c) => (
                      <th key={c}>{c}</th>
                  ))}
              </tr>
          </thead>
          <tbody>
              {results[0].values.map((r) => (
                  <tr key={r}>
                      {r.map((v) => (
                          <td key={v}>{v}</td>
                      ))}
                  </tr>
              ))}
          </tbody>
      </table></>
  );
}
