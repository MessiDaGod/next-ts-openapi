import { Vendor, emptyVendor } from "./Objects/Vendor";

// Register a new user
export async function getVendors(take: number | null = null) {
    try {
      let url = `https://localhost:5006/api/data/GetVendors${(take ? `?take=${take}` : "")}`;
      const response = await fetch(url, {
      method: 'GET'
    });
    const vendors: Vendor[] = JSON.parse(await response.text());
    return vendors;
  } catch (error) {
    return emptyVendor;
  }
}