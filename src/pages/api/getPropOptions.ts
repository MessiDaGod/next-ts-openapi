import { PropOptions } from "./Objects/PropOptions";

export async function getPropOptionsAsync<PropOptions>(
  take: number | null = null
): Promise<Array<PropOptions>> {
  try {
    let url = `https://localhost:5006/api/data/GetPropOptions${
      take ? `?take=${take}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
    });
    const propOptions: PropOptions[] = JSON.parse(await response.text());
    return propOptions;
  } catch (error) {
     return [];
  }
}

export async function getPropOptions(take: number | null = null) {
  try {
    let url = `https://localhost:5006/api/data/GetPropOptions${
      take ? `?take=${take}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
    }).then((res) => res);
    const propOptions: PropOptions[] = JSON.parse(await response.text());
    return propOptions;
  } catch (error) {
    return [];
  }
}
