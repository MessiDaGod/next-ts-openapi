export function isRowEmpty<T>(row: T): boolean {
    if (!row)
        return true;
    return Object.values(row).every(
        (value) => value === null ||
            value === "" ||
            value === "0" ||
            value === "-1" ||
            value === "0.000000" ||
            value === "NULL" ||
            value === 0
    );
}

export function isColumnHidden<T>(data: T[], columnName: string): boolean {
    if (Array.isArray(data)) {
        const columnData = data.map((row) => row[columnName]);
        return columnData.every(
            (value) => value === null ||
                value === "" ||
                value === "0" ||
                value === "-1" ||
                value === "0.000000" ||
                value === "NULL" ||
                value === 0
        );
    } else {
        return true;
    }
}