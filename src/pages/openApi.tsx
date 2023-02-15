import React, { useState, useRef } from "react";
import styles from "./index.module.css";
import CodeEditor from "./codeEditor";

interface Response {
  result: any;
  error: any;
}

function OpenApi(): React.ReactElement {
  const monacoRef = useRef();
  const [requestInputValue, setRequestInputValue] = useState<string>("");
  // const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // const [dropdown, setDropdown] = useState<string>("");
  // const [currentPrompt, setCurrentPrompt] = useState<string>("");

  const API_ENDPOINT = "/api/generate";

  const headers: any = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,PATCH,OPTIONS",
  };

  return (
    <main className={styles.main}>
      <h1>ChatGPT</h1>
      <form onSubmit={onSubmit}>
        <input
          id="getInput"
          type="submit"
          value="Submit to ChatGPT"
          disabled={loading}
          onClick={(e) => onGetInput(e)}
        />
      </form>
      <CodeEditor onExecute={() => executeCode(code)} />
    </main>
)

export default OpenApi;