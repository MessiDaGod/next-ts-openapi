import * as monaco from 'monaco-editor';
import { formatSql, OnChange } from './api/formatSql';
import MonacoEditor from "@monaco-editor/react";
import React, { useState, useRef, useEffect } from "react";

interface Props {
  value: string;
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

const CodeEditor: React.FC<Props> = ({ value, onChange }) => {
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const [editorValue, setValue] = React.useState('select * from Property');

  const handleChange = (newValue?: string, ev?: monaco.editor.IModelContentChangedEvent) => {
    if (newValue === undefined || newValue === '' || ev === undefined) return;
    setValue(newValue);
  };
  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    editor.onDidChangeModelContent(async (ev: monaco.editor.IModelContentChangedEvent) => {
      const sql = editor.getValue();
      await formatSql(sql).then((formattedSql) => {
        // Do something with the formatted SQL string
        console.log(formattedSql);
      });

      const model = editor.getModel();
      if (!model) {
        return;
      }
      const newValue = model.getValue();
      onChange(newValue, ev);
    });
  };

  return (
    <MonacoEditor
      height="50vh"
      language="sql"
      defaultValue={editorValue}
      value={editorValue}
      onChange={handleChange}
      onMount={handleEditorDidMount}
    />
  );
};

export default CodeEditor;
