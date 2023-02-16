import { FinVendorEtl, emptyVendor } from "./FinVendorEtl";

export const vendorProperties: FinVendorEtl = Object.keys(emptyVendor).reduce(
  (acc, key) => ({ ...acc, [key]: "" }),
  {} as FinVendorEtl
);

// Register a new user
export async function getVendors() {
    let url = `https://localhost:5006/api/data/GetVendors`;
    const response = await fetch(url, {
      method: 'GET'
    });
    const vendors: FinVendorEtl[] = JSON.parse(await response.text());
    return vendors;
}