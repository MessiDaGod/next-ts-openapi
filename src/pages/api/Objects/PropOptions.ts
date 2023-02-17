export type PropOptions = {
  id: number;
  property_Code: string;
  property_Name: string | null;
  type: string | null;
  stringValue: string | null;
  handleValue: string | null;
  handleValueInt: number | null;
  date: string | null;
  [key: string]: string | number | null;
};

export const emptyPropOptions: PropOptions = {
  id: 0,
  property_Code: "",
  property_Name: null,
  type: null,
  stringValue: null,
  handleValue: null,
  handleValueInt: null,
  date: null,
};

export const propOptionProperties: PropOptions = Object.keys(
  emptyPropOptions
).reduce((acc, key) => ({ ...acc, [key]: "" }), {} as PropOptions);

// Register a new user
export async function GetPropOptions() {
  let url = `https://localhost:5006/api/data/GetPropOptions`;
  const response = await fetch(url, {
    method: "GET",
  });
  return JSON.parse(await response.text()) as PropOptions[];
}

export function isPropOptions(object: any): object is PropOptions {
  return "id" in object && "handleValueInt" in object;
}