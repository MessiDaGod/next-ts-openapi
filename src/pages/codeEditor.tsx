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
  const [connection, setConnection] = useState<Connection | null>(null);

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

  // useEffect(() => {
  //   connectToDatabase()
  //     .then((conn) => {
  //       setConnection(conn);
  //     })
  //     .catch((err) => {
  //       console.log("Failed to connect to database", err);
  //     });
  // }, []);

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
