import { useState } from "react";

import { ChemInputs } from "./ChemInputs";
import { Autocomplete, Button } from "@equinor/eds-core-react";

/* import Button from 'react-bootstrap/Button'; */

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

interface Defaults {
  inputs: [string: number];
  pipeInputs: [string: number];
  column: string;
  row: string;
  value: string;
  outputs: string[];
}

interface SubmitParams {
  inputs: [string: number];
  pipeInputs: [string: number];
  columnValue: string;
  rowValue: string;
  valueValue: string;
}

interface FormProps {
  defaults: Defaults;
  onSubmit: (params: SubmitParams) => void;
}

function Form({ defaults, onSubmit }: FormProps) {
  const [inputs, setInputs] = useState(defaults.inputs);
  const [pipeInputs, setPipeInputs] = useState(defaults.pipeInputs);
  const [columnValue, setColumnValue] = useState(defaults.column);
  const [rowValue, setRowValue] = useState(defaults.row);
  const [valueValue, setValueValue] = useState(defaults.value);

  const inputKeys: string[] = Object.keys(defaults.inputs).concat(
    defaults.outputs,
  );
  const outputKeys: string[] = defaults.outputs;

  const handleSubmit = () => {
    onSubmit({
      inputs,
      pipeInputs,
      columnValue,
      rowValue,
      valueValue,
    });
  };

  let pipeParams = null;
  if (
    valueValue === "H2SO4_corrosion" ||
    valueValue === "HNO3_corrosion" ||
    valueValue === "corrosion_rate"
  ) {
    pipeParams = <ChemInputs inputs={pipeInputs} onChange={setPipeInputs} />;
  }

  return (
    <>
      <Row>
        <Col>
          <ChemInputs inputs={inputs} onChange={setInputs} />
        </Col>
        <Col>
          <Autocomplete
            label="Column parameter"
            options={inputKeys}
            initialSelectedOptions={[columnValue]}
            onInputChange={(newValue) => setColumnValue(newValue)}
            hideClearButton={true}
          />
          <Autocomplete
            label="Row parameter"
            options={inputKeys}
            initialSelectedOptions={[rowValue]}
            onInputChange={(newValue) => setRowValue(newValue)}
            hideClearButton={true}
          />
          <Autocomplete
            label="Value parameter"
            options={outputKeys}
            initialSelectedOptions={[valueValue]}
            onInputChange={(newValue) => setValueValue(newValue)}
            hideClearButton={true}
          />
        </Col>
        <Col>{pipeParams}</Col>
      </Row>
      <Row>
        <Col>
          <div className="d-grid">
            <Button onClick={handleSubmit}>Run Reactions</Button>
          </div>
        </Col>
      </Row>
    </>
  );
}

export { Form, SubmitParams };
