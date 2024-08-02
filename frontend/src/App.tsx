import { useState, useEffect } from "react";

import { Form, SubmitParams } from "./Form";
import { Output } from "./Output";
import { baseUrl } from "./util";
import Container from "react-bootstrap/Container";

function App() {
  const [defaults, setDefaults] = useState(null);
  const [inputs, setInputs] = useState<SubmitParams | null>(null);

  useEffect(() => {
    let ignore = false;

    if (defaults !== null) return;

    fetch(`${baseUrl}api/form_config`)
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
    <Container>
      <h1 className="text-center">CO2 spec demo</h1>
      <Form defaults={defaults} onSubmit={setInputs} />
      <Output inputs={inputs} />
    </Container>
  );
}

export default App;
