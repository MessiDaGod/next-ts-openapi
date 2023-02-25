export type PropOptions = {
  id: number;
  property_Code: string;
  property_Name: string;
  type: string;
  stringValue: string;
  handleValue: string;
  handleValueInt: number;
  date: string;
  [key: string]: string | number;
};

export const emptyPropOptions: PropOptions = {
  id: 0,
  property_Code: "",
  property_Name: "",
  type: "",
  stringValue: "",
  handleValue: "",
  handleValueInt: 0,
  date: "",
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