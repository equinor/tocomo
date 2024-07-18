import { useState, useEffect } from "react";

import "./App.css";
import { Form } from "./Form";
import { Output } from "./Output";
import { baseUrl } from "./util";

interface SubmitParams {
  inputs: [string: number];
  columnValue: string;
  rowValue: string;
  valueValue: string;
}

function App() {
  const [defaults, setDefaults] = useState(null);
  const [inputs, setInputs] = useState<SubmitParams | null>(null);

  useEffect(() => {
    let ignore = false;

    if (defaults !== null) return;

    fetch(`${baseUrl}api/compounds`)
      .then((resp) => resp.json())
      .then((data) => {
        if (!ignore) setDefaults(data);
      })
      .catch(console.error);

    return () => {
      ignore = true;
    };
  }, [defaults]);

  if (defaults === null) {
    return (
      <>
        <h1>CO2 spec demo</h1>
        <pre>Loading!</pre>
      </>
    );
  }

  return (
    <>
      <h1>CO2 spec demo</h1>
      <Form defaults={defaults} onSubmit={setInputs} />
      <Output inputs={inputs} />
    </>
  );
}

export default App;
