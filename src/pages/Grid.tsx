import { useState } from "react";
import Dropdown from "./Dropdown";
import DynamicGrid from "./DynamicGrid";
import styles from "./GridDropdown.module.scss";

export default function Form() {
  const [answer, setAnswer] = useState<number>(1);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("typing");
  const [item, setItem] = useState(null);
  const [numItems, setNumItems] = useState(1);

  function handleSetItem(e) {
    setItem(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitForm(item);
      setStatus("success");
    } catch (err) {
      setStatus("typing");
      setError(err);
    }
  }

  function handleTextareaChange(e) {
    console.log(`numItems changed to: ${numItems}`);
    setNumItems(e.target.value);
    setAnswer(e.target.value);
  }

  return (
    <div>
      <div className={styles["table"]}>
        <div className={styles["tr"]}>
          <Dropdown
            style={{
              display: "block",
              zIndex: 2,
            }}
            jsonFileName="GetOptions"
            label="Choose Item to Display"
            onChange={(e) => handleSetItem(e)}
            showCheckbox={true}
          />
        </div>
        <div className={styles["tr"]}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "block",
              zIndex: 3,
              margin: "20px",
            }}
          >
            <input
              style={{ top: "50px", display: "block" }}
              type="number"
              value={answer}
              onChange={handleTextareaChange}
              disabled={false}
            />
            <br />
            <button disabled={answer === 0}>Submit</button>
            {error !== null && <p className="Error">{error.message}</p>}
          </form>
        </div>
        <div className={styles["tr"]}>
          {status === "success" && (
            <DynamicGrid
              style={{
                display: "inline-block",
                margin: "50px",
                position: "relative",
              }}
              key={item}
              selectItem={item}
              showPagination={false}
              numItems={numItems}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function submitForm(answer) {
  // Pretend it's hitting the network.
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      let shouldError = answer === 0;
      if (shouldError) {
        reject(new Error("Please enter a # larger than 0!"));
      } else {
        resolve();
      }
    }, 100);
  });
}
