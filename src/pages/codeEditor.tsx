import * as monaco from "monaco-editor";
import { formatSql } from "./api/formatSql";
import StandaloneCodeEditor from "@monaco-editor/react";
import React, { useState, useRef, useEffect } from "react";

interface CodeEditorProps {
  initialValue: string;
  language: string | undefined;
  height: string | undefined;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, language, height }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const editorValueRef = useRef(initialValue);
  const [editorValue, seteditorValue] = useState('SELECT * FROM Property;');

  useEffect(() => {
    async function fetchData() {
      seteditorValue(editorValue);
      // LogData();
    }
    fetchData();
  }, [editorValue]);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    // @ts-ignore
    editorRef.current = editor;
    editor.onDidChangeModelContent(async () => {
      const sql = editor.getValue();
      await formatSql(sql).then((formattedSql) => {
        // Do something with the formatted SQL string
        console.log(formattedSql);
      });
    });
  };

  const handleFormatClick = () => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      formatSql(currentValue).then((formattedSql) => {
        editorRef.current?.setValue(formattedSql);
        editorValueRef.current = formattedSql;
      });
    }
  };

  async function handleSetEditorValue() {
    const value = await GetValue();
    if (value) seteditorValue(value);
  }

  async function GetValue() {
    if (editorRef.current) {
      const newValue = editorRef.current.getValue();
      return newValue;
    }
  }

  return (
    <>
      <div>
        <StandaloneCodeEditor
          height={height ?? "50vh"}
          language={language ?? "sql"}
          defaultValue={initialValue}
          value={editorValueRef.current}
          onMount={handleEditorDidMount}
        />
        <button onClick={handleFormatClick}>Format</button>
        <button onClick={handleSetEditorValue}>Set Value</button>
      </div>
      <pre>

      </pre>
    </>
  );
};

export default CodeEditor;
