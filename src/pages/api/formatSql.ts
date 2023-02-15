import * as monaco from "monaco-editor";

export type OnChange = (value: string | undefined, ev: monaco.editor.IModelContentChangedEvent) => void;

export async function formatSql(sql: string) {
    const response = await fetch(
      `https://localhost:5006/api/sql/GetFormattedSql?value=${encodeURIComponent(sql)}`,
      {
        method: 'GET',
        headers: {
          accept: 'text/plain'
        }
      }
    );
    const formattedSql = await response.text();
    return formattedSql;
  }
