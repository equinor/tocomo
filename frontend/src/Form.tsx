import { useState } from "react";

import { ChemInputs, FormControl } from "./ChemInputs";
import { Autocomplete, Button } from "@equinor/eds-core-react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

interface Defaults {
  inputs: FormControl[];
  pipeInputs: FormControl[];
  outputs: FormControl[];
  column: string;
  row: string;
  value: string;
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

function getDefaultOption(
  name: string,
  ...options: FormControl[][]
): FormControl {
  for (const opts of options) {
    const o = opts.find((opt) => opt.name === name);
    if (o !== undefined) return o;
  }
  throw "Option not found";
}

function getDefaultValues(inputs: FormControl[]): [string: number] {
  let values: [string: number] = {};
  for (const input of inputs) values[input.name] = input.init!;
  return values;
}

function Form({ defaults, onSubmit }: FormProps) {
  const [inputs, setInputs] = useState(() => getDefaultValues(defaults.inputs));
  const [pipeInputs, setPipeInputs] = useState(() =>
    getDefaultValues(defaults.pipeInputs),
  );
  const [columnValue, setColumnValue] = useState(() =>
    getDefaultOption(defaults.column, defaults.inputs),
  );
  const [rowValue, setRowValue] = useState(() =>
    getDefaultOption(defaults.row, defaults.inputs),
  );
  const [valueValue, setValueValue] = useState(() =>
    getDefaultOption(defaults.value, defaults.inputs, defaults.outputs),
  );

  const handleReset = () => {
    setInputs(() => getDefaultValues(defaults.inputs));
    setPipeInputs(() => getDefaultValues(defaults.pipeInputs));
    setColumnValue(() => getDefaultOption(defaults.column, defaults.inputs));
    setRowValue(() => getDefaultOption(defaults.row, defaults.inputs));
    setValueValue(() =>
      getDefaultOption(defaults.row, defaults.inputs, defaults.outputs),
    );
  };

  const handleSubmit = () => {
    onSubmit({
      inputs,
      pipeInputs,
      columnValue: columnValue.name,
      rowValue: rowValue.name,
      valueValue: valueValue.name,
    });
  };

  return (
    <>
      <Row>
        <Col>
          <ChemInputs
            inputs={defaults.inputs}
            values={inputs}
            onChange={setInputs}
          />
        </Col>
        <Col>
          <Autocomplete
            label="Column parameter"
            options={defaults.inputs}
            optionLabel={(x) => x.text}
            initialSelectedOptions={[columnValue]}
            onOptionsChange={(newValue) =>
              setColumnValue(newValue.selectedItems[0])
            }
            hideClearButton={true}
          />
          <Autocomplete
            label="Row parameter"
            options={defaults.inputs}
            optionLabel={(x) => x.text}
            initialSelectedOptions={[rowValue]}
            onOptionsChange={(newValue) =>
              setRowValue(newValue.selectedItems[0])
            }
            hideClearButton={true}
          />
          <Autocomplete
            label="Value parameter"
            options={defaults.outputs}
            optionLabel={(x) => x.text}
            initialSelectedOptions={[valueValue]}
            onOptionsChange={(newValue) =>
              setValueValue(newValue.selectedItems[0])
            }
            hideClearButton={true}
          />
        </Col>
        <Col>
          {valueValue.needsPipeInput ? (
            <ChemInputs
              inputs={defaults.pipeInputs}
              values={pipeInputs}
              onChange={setPipeInputs}
            />
          ) : null}
        </Col>
      </Row>
      <Row>
        <Col className="d-grid">
          <Button onClick={handleReset}>Reset Inputs</Button>
        </Col>
        <Col className="d-grid">
          <Button onClick={handleSubmit}>Run Reactions</Button>
        </Col>
      </Row>
    </>
  );
}

export { Form, SubmitParams };
