import * as monaco from 'monaco-editor';
import { formatSql } from './api/formatSql';
import StandaloneCodeEditor, { OnChange } from "@monaco-editor/react";
import React, { useState, useRef, useEffect } from "react";

interface EditorProps {
  onChange: OnChange;
}

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

const CodeEditor: React.FC<EditorProps> = ({ onChange }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const [editorValue, setValue] = useState('SELECT * FROM Property;');

  const handleChange = (value: string, e: monaco.editor.IModelContentChangedEvent) => {
    onChange(value, e);
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // @ts-ignore
    editorRef.current = editor;
    editor.onDidChangeModelContent(async (ev: monaco.editor.IModelContentChangedEvent) => {
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
