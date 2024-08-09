import React, { useState, useContext } from "react";

import { Form, SubmitParams } from "./Form";
import { Output } from "./Output";
import { History } from "./History.tsx";
import { Config, ConfigContext } from "./Config";

import "./App.css";
import {
  Middle,
  Accordion,
  Button,
  Divider,
  Icon,
  SideBar,
  TopBar,
  Typography,
} from "@equinor/eds-core-react";
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
              The CO₂ specification calculator provides a way to give an
              estimate of concentrations given a known input. A set of equations
              are applied in order:
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

function App() {
  const [inputs, setInputs] = useState<SubmitParams | null>(null);

  return (
    <>
      <TopBar>
        <TopBar.Header>
          <Icon data={apps} />
          CO₂ spec demo
        </TopBar.Header>
      </TopBar>
      <Config>
        <SideBar>
          <SideBar.Content>
            <SideBar.Toggle />
            <SideBar.Button label="Hello" icon={apps} />
            <SideBar.Footer>
              <Divider size="2" color="light"></Divider>
            </SideBar.Footer>
          </SideBar.Content>
        </SideBar>
        <CalculationInformation />
        <Form onSubmit={setInputs} />
        <Output inputs={inputs} />
      </Config>
    </>
  );
}

export default App;
