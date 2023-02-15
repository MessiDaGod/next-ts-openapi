import React, { useState, useRef } from "react";
import styles from "./index.module.css";
import CodeEditor from "./CodeEditor/codeEditor";

interface Response {
  result: any;
  error: any;
}

function OpenApi(): React.ReactElement {
  const monacoRef = useRef();
  const [requestInputValue, setRequestInputValue] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdown, setDropdown] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");

  const API_ENDPOINT = "/api/generate";

  const headers: any = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,PATCH,OPTIONS",
  };

  const executeCode = async (code: string): Promise<void> => {
    try {
      const response: Response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => response.json());
      setResponse(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  async function onGetInput(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault();
    var inputOptions = document.getElementById("options");
    if (inputOptions) {
        setRequestInputValue(inputOptions.value);
    }
    setLoading(true);

    try {
      const response: Response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ requestText: requestInputValue }),
      }).then((response) => response.json());

      monacoRef.current.setValue(JSON.stringify(response));
      if (response.status !== 200) {
        alert(response.error.message);
        throw (
          response.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  async function onSubmit(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);

    try {
      const response: Response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ requestText: defaultValue.Value }),
      }).then((response) => response.json());

      if (response.status !== 200) {
        alert(response.error.message);
        throw (
          response.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setLoading(false);
      setResponse(response.result);
      setRequestInputValue("");
    } catch (error) {
      setLoading(false);
    }
  }

  async function onDropdownChange(e: React.ChangeEvent<HTMLSelectElement>): Promise<void> {
    e.preventDefault();
    document.getElementById("inputField");
    if (e.target.value === "review") {
        let elem = document.getElementById("inputField");
        if (elem) {
            elem.style.display = "none";
    }
   }
}

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

export default OpenApi()