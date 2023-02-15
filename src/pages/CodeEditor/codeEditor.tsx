import * as monaco from 'monaco-editor';
import { formatSql } from '../api/formatSql';
import StandaloneCodeEditor from "@monaco-editor/react";
import React, { useState, useRef } from "react";

// interface EditorProps {
//   onChange: OnChange;
// }

const CodeEditor: React.FC = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const [editorValue] = useState('SELECT * FROM Property;');

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
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
      });
    }
  };

  return (
    <div>
      <StandaloneCodeEditor
        height="50vh"
        language="sql"
        defaultValue={editorValue}
        value={editorValue}
        onMount={handleEditorDidMount}
      />
      <button onClick={handleFormatClick}>Format</button>
    </div>
  );
};

export default CodeEditor;
