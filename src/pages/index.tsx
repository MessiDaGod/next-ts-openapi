import DynamicGrid from "./dynamicGrid";
import React from "react";
import { getVendors } from "./api/getVendors";
import { getPropOptions } from "./api/getPropOptions";
import Dropdown from "./dropdown";

export default function Home() {
  const [data, setData] = React.useState<any>([]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPropOptions(1000);
        setData(response);
      } catch (error) {
        return [];
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container">

    </div>
  );
}
