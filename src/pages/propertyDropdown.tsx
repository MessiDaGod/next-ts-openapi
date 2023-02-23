import React, { useState } from "react";
import { getPropOptions } from "./api/getPropOptions";
import { emptyPropOptions, PropOptions } from "./api/Objects/PropOptions";
import styles from "../styles/yardiInterface.module.scss";
import PropOptionsPage from "./propOptions";

type DropdownProps = {
  data?: {
    Id: number;
    Property_Code: string;
    Property_Name: string;
    Type: string;
    StringValue: string;
    HandleValue: string;
    HandleValueInt: number | null;
    Date: string | null;
  }[];
};

const PropertyDropdown: React.FC<DropdownProps> = ({}) => {
  const [data, setData] = React.useState<PropOptions[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPropOptions(1000);
        const items = JSON.parse(JSON.stringify(response));
        setData(items);
      } catch (error) {
        return emptyPropOptions;
      }
    }
    fetchData();
  }, [showSearchBox]);

  const filteredData = Array.isArray(data)
    ? data.filter(
        (item) =>
          item.Property_Code.toString()
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          item.Property_Name.toString()
            .toLowerCase()
            .includes(searchText.toLowerCase())
      )
    : data;

  return (
    <div
      className="dropdown"
      onMouseEnter={() => setShowSearchBox(true)}
      onMouseLeave={() => setShowSearchBox(false)}
    >
      <div className="dropdown rz-dropdown" tabIndex={0} id="U8ve8E4Fjk">
        <div className="rz-helper-hidden-accessible">
          <input
            tabIndex={-1}
            style={{ width: "100%" }}
            aria-haspopup="listbox"
            readOnly={true}
            type="text"
            aria-label=""
          />
        </div>
        <label
          className="rz-dropdown-label rz-inputtext  rz-placeholder"
          style={{ width: "100%" }}
        >
          Property
        </label>
        <div className="rz-dropdown-trigger  rz-corner-right">
          <span className="rz-dropdown-trigger-icon  rzi rzi-chevron-down"></span>
        </div>
        <div
          className="dropdown-content rz-dropdown-panel"
          style={{ visibility: "visible" }}
        >
          <div className="rz-lookup-panel">
            <div className="rz-lookup-search">
              <input
                id="search-U8ve8E4Fjk"
                tabIndex={-1}
                placeholder="Search..."
                className="dropbtn"
              />
            </div>
            <div
              className="rz-data-grid rz-has-paginator rz-datatable  rz-datatable-scrollable rz-selectable rz-datatable-reflow dropdown"
              id="0X-VvO0ACk"
            >
              <div className="rz-data-grid-data">
                <table className="gridjs-table rz-grid-table">
                  <colgroup>
                    <col id="0X-VvO0ACk0-col" />
                    <col id="0X-VvO0ACk1-col" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th
                        rowSpan={1}
                        colSpan={1}
                        className="rz-unselectable-text rz-sortable-column"
                        scope="col"
                      >
                        <div
                          style={{ width: "100%", outline: "none" }}
                          tabIndex={0}
                        >
                          <span className="rz-column-title">Code</span>
                          <span className="rz-sortable-column-icon rzi-grid-sort rzi-sort"></span>
                        </div>
                      </th>
                      <th
                        rowSpan={1}
                        colSpan={1}
                        className="rz-unselectable-text rz-sortable-column"
                        scope="col"
                      >
                        <div
                          style={{ width: "100%", outline: "none" }}
                          tabIndex={0}
                        >
                          <span className="rz-column-title">Description</span>
                          <span className="rz-sortable-column-icon rzi-grid-sort rzi-sort"></span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="rz-datatable-odd gridjs-tr   gridjs-tr">
                      <td rowSpan={1} colSpan={1}>
                        <span className="rz-column-title">Code</span>
                        <span className="rz-cell-data" title="102103">
                          102103
                        </span>
                      </td>
                      <td rowSpan={1} colSpan={1}>
                        <span className="rz-column-title">Description</span>
                        <span className="rz-cell-data" title="901 Fifth">
                          901 Fifth
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div
                  className="rz-paginator rz-unselectable-text rz-helper-clearfix rz-align-justify"
                  id="popup0X-VvO0ACk"
                >
                  <label className="rz-paginator-summary">
                    Page 1 of 32 (319 items)
                  </label>
                  <a
                    className="rz-paginator-first rz-paginator-element rz-state-disabled"
                    href="javascript:void(0)"
                    tabIndex={-1}
                  >
                    <span className="rz-paginator-icon rzi rzi-step-backward"></span>
                  </a>
                  <a
                    className="rz-paginator-prev rz-paginator-element rz-state-disabled"
                    href="javascript:void(0)"
                    tabIndex={-1}
                  >
                    <span className="rz-paginator-icon rzi rzi-caret-left"></span>
                  </a>
                  <span className="rz-paginator-pages">
                    <a
                      className="rz-paginator-page rz-paginator-element rz-state-active"
                      href="javascript:void(0)"
                    >
                      1
                    </a>
                    <a
                      className="rz-paginator-page rz-paginator-element "
                      href="javascript:void(0)"
                    >
                      2
                    </a>
                    <a
                      className="rz-paginator-page rz-paginator-element "
                      href="javascript:void(0)"
                    >
                      3
                    </a>
                    <a
                      className="rz-paginator-page rz-paginator-element "
                      href="javascript:void(0)"
                    >
                      4
                    </a>
                    <a
                      className="rz-paginator-page rz-paginator-element "
                      href="javascript:void(0)"
                    >
                      5
                    </a>
                  </span>
                  <a
                    className="rz-paginator-next rz-paginator-element "
                    href="javascript:void(0)"
                    tabIndex={0}
                  >
                    <span className="rz-paginator-icon rzi rzi-caret-right"></span>
                  </a>
                  <a
                    className="rz-paginator-last rz-paginator-element  "
                    href="javascript:void(0)"
                    tabIndex={0}
                  >
                    <span className="rz-paginator-icon rzi rzi-step-forward"></span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDropdown;
