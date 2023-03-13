import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function SDatePicker() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  function handleDateChange(e) {
    setSelectedDate(e);
  }

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => handleDateChange(date)}
    />
  );
}
