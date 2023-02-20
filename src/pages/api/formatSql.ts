import * as monaco from "monaco-editor";

export type OnChange = (
  value: string | undefined,
  ev: monaco.editor.IModelContentChangedEvent
) => void;

export async function formatSql(sql: string) {
  const data = await fetch(
    `https://localhost:5006/api/sql/GetFormattedSql?value=${encodeURIComponent(
      sql
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sql),
    }
  );
  const formattedSql = await data.text();
  return formattedSql;
}
