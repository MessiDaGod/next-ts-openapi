import { Account } from "./Objects/Account";

export async function getAccounts(take: number | null = null) {
    try {
      let url = `https://localhost:5006/api/data/GetAccounts${(take ? `?take=${take}` : "")}`;
      const response = await fetch(url, {
      method: 'GET'
    });
    const Accounts: Account[] = JSON.parse(await response.text());
    return Accounts;
  } catch (error) {
     // ignore
  }
}