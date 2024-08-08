import { useState, useContext } from "react";

import { Form, SubmitParams } from "./Form";
import { Output } from "./Output";
import Container from "react-bootstrap/Container";
import { Config, ConfigContext } from "./Config";

function CalculationInformation() {
  const config = useContext(ConfigContext);

  return (
    <>
      <p>
        The CO₂ specification calculator provides a way to give an estimate of
        concentrations given a known input. A set of equations are applied in
        order:
      </p>
      <p>
        {config.reaction_order.flatMap((v, i) => (
          <div key={i}>
            {" "}
            <span className="badge bg-secondary">{v}</span>{" "}
            {config.reactions[v]}
          </div>
        ))}
      </p>
      <p>
        Some of the products in one equation is input to another, therefore the
        equations will be reapplied until no more reactions can occur. The
        following rule applies: We go through the list in the order given and
        try to apply the reaction. If it is not possible with the current
        equation we continue to the next. If a reaction can occur it will be
        applied and then we start from the top again.
      </p>
    </>
  );
}

function App() {
  const [inputs, setInputs] = useState<SubmitParams | null>(null);

  return (
    <Container>
      <h1 className="text-center">CO₂ spec demo</h1>
      <Config>
        <CalculationInformation />
        <Form onSubmit={setInputs} />
        <Output inputs={inputs} />
      </Config>
    </Container>
  );
}

export default App;
