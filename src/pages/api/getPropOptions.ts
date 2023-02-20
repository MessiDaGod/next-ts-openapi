import { PropOptions } from "./Objects/PropOptions";

// Register a new user
export async function getPropOptions(take: number | null = null) {
    try {
      let url = `https://localhost:5006/api/data/GetPropOptions${(take ? `?take=${take}` : "")}`;
      const response = await fetch(url, {
      method: 'GET'
    });
    const propOptions: PropOptions[] = JSON.parse(await response.text());
    return propOptions;
  } catch (error) {
     // ignore
  }
}