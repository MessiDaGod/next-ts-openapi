import * as monaco from "monaco-editor";
import Editor from "@monaco-editor/react";
import React, { useState, useRef, useEffect } from "react";
// import { connectToDatabase, Connection } from "../database";

const scrollbarOptions: monaco.editor.IEditorScrollbarOptions = {
  alwaysConsumeMouseWheel: false,
  arrowSize: 11,
  handleMouseWheel: true,
  horizontal: "auto",
  horizontalHasArrows: false,
  horizontalScrollbarSize: 10,
  horizontalSliderSize: 0.5,
  vertical: "auto",
  verticalHasArrows: false,
  verticalScrollbarSize: 10,
  verticalSliderSize: 0.5,
  useShadows: true,
};

const editorOptions: monaco.editor.IEditorConstructionOptions = {
  automaticLayout: true,
  wordWrap: "on",
  scrollbar: scrollbarOptions,
};

const CodeEditor: React.FC = () => {
  const monacoRef = useRef<any>(null);
  const defaultValue = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  const [code, setCode] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState<string>(defaultValue);
  // const [connection, setConnection] = useState<Connection | null>(null);

  function handleEditorWillMount(monaco: any) {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    monacoRef.current = editor;
    monacoRef.current.setValue(currentPrompt);
  }

  const handleExecute = () => {
    setCode(monacoRef.current.getValue());
  };

  const value = 'defaultConnection';
  const userId = 1;
  const url = `http://localhost:3000/api/database?value=${value}&userId=${userId}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error inserting value into table');
      }
      return response.json();
    })
    .then(data => {
      console.log(data.message);
    })
    .catch(error => {
      console.error(error);
    });


  return (
    <Editor
      height="20vh"
      defaultLanguage="txt"
      defaultValue={defaultValue}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
    />
  );
};

export default CodeEditor;
