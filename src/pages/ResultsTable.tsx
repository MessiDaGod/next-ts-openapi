// import { Payable } from "./dataStructure";
import useBinaryFile from "./useBinaryFile";
import { useDB, useDBQuery } from "./useDB";
import { useState } from "react";
import Script from "next/script";

// import sqlite3 from "sqlite3";
// import { open, Database } from "sqlite";

// const dbPath = "./database.sqlite";

// async function CreateTable() {
//   const db = await open({
//     filename: dbPath,
//     driver: sqlite3.Database,
//   });
//   await db.run(`
// CREATE TABLE IF NOT EXISTS Payable (
//   "Id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
//   TRANNUM TEXT,
//   PERSON TEXT,
//   OFFSET TEXT,
//   ACCRUAL TEXT,
//   POSTMONTH TEXT,
//   DATE TEXT,
//   DUEDATE TEXT,
//   AMOUNT TEXT,
//   PROPERTY TEXT,
//   ACCOUNT TEXT,
//   NOTES TEXT,
//   REF TEXT,
//   CHECKNUM TEXT,
//   DESC TEXT,
//   EXPENSETYPE TEXT,
//   DETAILTAXAMOUNT1 TEXT,
//   DETAILTAXAMOUNT2 TEXT,
//   DETAILTRANAMOUNT TEXT,
//   DETAILVATTRANTYPEID TEXT,
//   DETAILVATRATEID TEXT,
//   TRANCURRENCYID TEXT,
//   EXCHANGERATE TEXT,
//   EXCHANGERATE2 TEXT,
//   AMOUNT2 TEXT,
//   DOCUMENTSEQUENCENUMBER TEXT,
//   DISPLAYTYPE TEXT,
//   Company TEXT,
//   FundingEntity TEXT,
//   JOB TEXT,
//   CATEGORY TEXT,
//   CONTRACT TEXT,
//   COSTCODE TEXT,
//   USERDEFINEDFIELD1 TEXT,
//   USERDEFINEDFIELD2 TEXT,
//   USERDEFINEDFIELD3 TEXT,
//   USERDEFINEDFIELD4 TEXT,
//   USERDEFINEDFIELD5 TEXT,
//   USERDEFINEDFIELD6 TEXT,
//   USERDEFINEDFIELD7 TEXT,
//   USERDEFINEDFIELD8 TEXT,
//   USERDEFINEDFIELD9 TEXT,
//   USERDEFINEDFIELD10 TEXT,
//   INTERNATIONALPAYMENTTYPE TEXT,
//   WORKFLOW TEXT,
//   WORKFLOWSTATUS TEXT,
//   WORKFLOWSTEP TEXT,
//   DETAILFIELD1 TEXT,
//   DETAILFIELD2 TEXT,
//   DETAILFIELD3 TEXT,
//   DETAILFIELD4 TEXT,
//   DETAILFIELD5 TEXT,
//   DETAILFIELD6 TEXT,
//   DETAILFIELD7 TEXT,
//   DETAILFIELD8 TEXT,
//   NOTES2 TEXT,
//   PONUM TEXT,
//   PODETAILID TEXT,
//   TRANDATE TEXT,
//   RETENTION TEXT,
//   ORIGINALUREF TEXT,
//   CREDITMEMO TEXT,
//   ADJUSTMENT TEXT,
//   Labour TEXT,
//   Material TEXT,
//   CITBLevy TEXT,
//   ManufacturingCosts TEXT,
//   Travel TEXT,
//   NonCisLabor TEXT`);
// }

// // create the table and insert the records
// (async () => {
//   const db = open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//   });
// })();
// // create a function to query the table and log the results
// async function queryTable(db: sqlite3.Database) {
//   const results = await db.all("SELECT * FROM Payable");
//   console.log(results);
// }
// // create a function to insert the records
// async function insertRecords(db: sqlite3.Database, records: Payable[]) {
//   for (const record of records) {
//     const values = Object.values(record).map((value) =>
//       typeof value === "string" ? `"${value}"` : value
//     );
//     const sql = `INSERT INTO Payable (${Object.keys(record).join(
//       ","
//     )}) VALUES (${values.join(",")})`;
//     await db.run(sql);
//   }
// }

// async function postData(e) {
//   await CreateTable();
// }

export function ResultTable() {
  const [query] = useState(
    "SELECT name FROM  sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';"
  );
  const data = useBinaryFile(
    "database.sqlite"
  );
  const db = useDB(data);

  const results = useDBQuery(db, query);

  return (
    <>
      <Script type="module" strategy="beforeInteractive" src="/sql-loader.js" />
      <table className="w-full">
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
      </table>
    </>
  );
}
