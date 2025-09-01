import { useState, useContext } from "react";

import { Form, SubmitParams } from "./Form";
import { Output } from "./Output";
import { History } from "./History.tsx";
import { Config, ConfigContext } from "./Config";

import "./App.css";
import { Accordion, Icon, TopBar, Typography } from "@equinor/eds-core-react";
import { apps } from "@equinor/eds-icons";

function CalculationInformation() {
  const config = useContext(ConfigContext);

  return (
    <Accordion className="mb-4">
      <Accordion.Item>
        <Accordion.Header>How this works</Accordion.Header>
        <Accordion.Panel>
          <section className="copy">
            <Typography variant="body_long">
              The Total Consumption Model provides a way to give an estimate of
              concentrations given a known input. A set of equations are applied
              in order:
            </Typography>

            <div>
              {config.reaction_order.flatMap((v, i) => (
                <Typography key={i}>
                  <span className="badge bg-secondary">{v}</span>
                  <span className="mx-2"> {config.reactions[v]} </span>
                </Typography>
              ))}
            </div>

            <Typography variant="body_long">
              Some of the products in one equation is input to another,
              therefore the equations will be reapplied until no more reactions
              can occur. The following rule applies: We go through the list in
              the order given and try to apply the reaction. If it is not
              possible with the current equation we continue to the next. If a
              reaction can occur it will be applied and then we start from the
              top again.
            </Typography>
          </section>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

function getHistoryFromLocalStorage(): SubmitParams[] {
  const history = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key!);
    history.push([key!, val!]);
  }
  return history
    .sort((lhs, rhs) => rhs[0].localeCompare(lhs[0]))
    .flatMap((v) => JSON.parse(v[1]));
}

function App() {
  const [inputs, setInputs] = useState<SubmitParams | null>(null);
  const [history, setHistory] = useState(getHistoryFromLocalStorage);

  const onFormSubmit = (inputs: SubmitParams) => {
    setHistory([inputs, ...history]);
    setInputs(inputs);
    localStorage.setItem(
      localStorage.length.toString(),
      JSON.stringify(inputs),
    );
  };

  return (
    <>
      <TopBar>
        <TopBar.Header>
          <Icon data={apps} />
          Total Consumption Model
        </TopBar.Header>
      </TopBar>
      <Config>
        <div className="container-fluid">
          <div className="row">
            <div className="col-2">
              <History
                history={history}
                onClear={() => setHistory([])}
                setInput={(inputs) => setInputs(inputs)}
              />
            </div>
            <div className="col-10">
              <CalculationInformation />
              <Form onSubmit={onFormSubmit} />
              <Output inputs={inputs} />
            </div>
          </div>
        </div>
      </Config>
    </>
  );
}

export default App;
