import { useState } from "react";

import { Form, SubmitParams } from "./Form";
import { Output } from "./Output";
import Container from "react-bootstrap/Container";
import { Config } from "./Config";

function App() {
  const [inputs, setInputs] = useState<SubmitParams | null>(null);

  return (
    <Container>
      <h1 className="text-center">CO₂ spec demo</h1>
      <Config>
        <Form onSubmit={setInputs} />
        <Output inputs={inputs} />
      </Config>
    </Container>
  );
}

export default App;
