import { Vendor, emptyVendor } from "./Objects/Vendor";

// Register a new user
export async function getVendors() {
    try {
      const url = `https://localhost:5006/api/data/GetVendors`;
      const response = await fetch(url, {
      method: 'GET'
    });
    const vendors: Vendor[] = JSON.parse(await response.text());
    return vendors;
  } catch (error) {
    return emptyVendor;
  }
}