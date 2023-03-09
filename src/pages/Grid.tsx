import { useState } from "react";
import React from "react";
import Dropdown from "./dropdown";
import DynamicGrid from "./DynamicGrid";
import GenericDropdown from "./GenericDropdown";
// import GenericDropdown from "./GenericDropdown";
// import GoodColumns from "../../public/GoodColumns.json";
// import dimensions from "../../public/Dimensions.json";
// import DynamicGridProps from "./DynamicGrid";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { Payable } from "./dataStructure";
import { GetServerSideProps } from 'next'
import { Log } from "./utils";

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
//   const db = await open({
//     filename: dbPath,
//     driver: sqlite3.Database,
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


// export const getServerSideProps: GetServerSideProps<{ data: Payable[] }> = async (context) => {
//   const res = await fetch('public/Dimensions.json')
//   const data: Payable[] = await res.json()

//   Log(data);
//   return {
//     props: {
//       data,
//     },
//   }
// }

export default function Grid({}) {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("typing");
  const [item, setItem] = useState("");
  const [numItems, setNumItems] = useState<number>(1);
  const tableRef = React.useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const propertyInputId = React.useId();

  // // Initialize the database
  // async function initializeDb() {
  //   const db = await open({
  //     filename: dbPath,
  //     driver: sqlite3.Database,
  //   });
  // }


  async function handleSetItem(e) {
    setItem(e);
    setStatus("submitting");
    try {
      await submitForm(item);
      setStatus("success");
    } catch (err) {
      setStatus("typing");
      setError(err);
    }
    await submitForm(item);
  }

  async function handleTextareaChange(e) {
    setNumItems(e.target.value);
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitForm(item);
      setStatus("success");
    } catch (err) {
      setStatus("typing");
      setError(err);
    }
  }

  return (
    <>
      <>
        <section
          className="flex flex-grow p-4 gap-4 overflow-x-auto"
          style={{
            flexFlow: "row nowrap",
            placeContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <div
            className="rounded"
            style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="w-full bg-white shadow flex rounded items-center">
              <Dropdown
                jsonFileName="GetOptions"
                label="Choose Item"
                onItemChange={(e) => handleSetItem(e)}
                showCheckbox={true}
              />
            </div>
          </div>
          <div
            className="rounded"
            style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="w-full bg-white shadow flex rounded items-center">
              <div className="flex-1 relative flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                  <GenericDropdown
                    selectItem={"GetPropOptions"}
                    showPagination={true}
                    showCheckbox={false}
                    tableRef={tableRef}
                    value={inputValue}
                    isMultiple={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded"
            style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="w-full bg-white shadow flex rounded items-center">
              <div className="flex-1 relative flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                  <GenericDropdown
                    selectItem={"GetVendors"}
                    showPagination={true}
                    showCheckbox={false}
                    tableRef={tableRef}
                    value={inputValue}
                    isMultiple={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded"
            style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="w-full bg-white shadow flex rounded items-center">
              <div className="flex-1 relative flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                  <GenericDropdown
                    selectItem={"GetAccounts"}
                    showPagination={true}
                    showCheckbox={false}
                    tableRef={tableRef}
                    value={inputValue}
                    isMultiple={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded" style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}>
            <div className="w-full shadow flex rounded items-center">
              <div className="flex-1 relative flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative">
                  <form
                    style={{
                      color: "black",
                      borderRadius: "6px",
                      width: "50px",
                      alignContent: "center",
                    }}
                  >
                    <input
                      type="number"
                      value={numItems}
                      onChange={handleTextareaChange}
                      disabled={false}
                      style={{
                        color: "black",
                        borderRadius: "6px",
                        width: "inherit",
                        alignContent: "center",
                        height: "30px",
                      }}
                    />
                    <br />
                    {error !== null && <p className="Error">{error.message}</p>}
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded" style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}>
            <div className="w-full shadow flex rounded items-center">
              <div className="flex-1 relative flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative">
                  <button>Post Data</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
      <div
        style={{ flexDirection: "column", flexWrap: "wrap", order: 5 }}
        ref={tableRef}
      >
        {status === "success" && (
          <DynamicGrid
            key={item}
            selectItem={item}
            showPagination={true}
            numItems={numItems}
          />
        )}
      </div>
    </>
  );
}

function submitForm(answer) {
  // Pretend it's hitting the network.
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      let shouldError = answer === 0;
      if (shouldError) {
        reject(new Error("Please enter a # larger than 0!"));
      } else {
        resolve();
      }
    }, 100);
  });
}
