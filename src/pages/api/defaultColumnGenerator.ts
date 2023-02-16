export interface Columns<T> {
  [key: number]: keyof T;
  name: string;
  displayName: string;
}

export function GenerateDefaultColumns<T>(type: T): Columns<T>[] {
  const keys = Object.keys(type as object) as (keyof T)[];

  const columns: Columns<T>[] = keys.map((key, index) => {
    const capitalizedHeader = key
      .toString()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      key: index,
      name: key as string,
      displayName: capitalizedHeader,
    };
  });

  return columns;
}
