import { ChangeEvent, useState } from "react";

interface Props {
  value: string,
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function TableBodyCellValue({ }: Props) {
  const [inputValue, setInputValue] = useState('');

    function handleInputChange(event) {
    setInputValue(event.target.value);
  }

  return <input value={inputValue} onChange={handleInputChange}></input>;
}
