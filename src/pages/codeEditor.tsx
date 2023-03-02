import * as monaco from "monaco-editor";
import { formatSql } from "./api/formatSql";
import StandaloneCodeEditor from "@monaco-editor/react";
import React, { useState, useRef, useEffect } from "react";
import styles from "./Home.module.scss";


interface CodeEditorProps  {
  initialValue: string;
  language: string | undefined;
  height: number;
  width: number;
}



const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, language, height, width }) => {
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
    editorRef.current = editor;
    editor.onDidChangeModelContent(async () => {
      // const sql = editor.getValue();
      // await formatSql(sql);
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

  return (
    <div className={styles.container}>
      <StandaloneCodeEditor
        height={height ?? "50vh"}
        width={width ?? "50vw"}
        language={language ?? "sql"}
        defaultValue={initialValue}
        value={editorValueRef.current}
        onMount={handleEditorDidMount}
      />
      <button style={{ display: "block" }} onClick={handleFormatClick}>
        Format
      </button>
    </div>
  );
};

export default CodeEditor;
