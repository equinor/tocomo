import { useContext, useState } from "react";

import { Autocomplete, Button } from "@equinor/eds-core-react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { ChemInputs, FormControl } from "./ChemInputs";
import { ConfigContext } from "./Config";

interface SubmitParams {
  inputs: { [key: string]: number };
  pipeInputs: { [key: string]: number };
  columnValue: string;
  rowValue: string;
  valueValue: string;
}

interface FormProps {
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

function getDefaultValues(inputs: FormControl[]): { [key: string]: number } {
  const values: { [key: string]: number } = {};
  for (const input of inputs) values[input.name] = input.init!;
  return values;
}

function Form({ onSubmit }: FormProps) {
  const config = useContext(ConfigContext);

  const [inputs, setInputs] = useState(() => getDefaultValues(config.inputs));
  const [pipeInputs, setPipeInputs] = useState(() =>
    getDefaultValues(config.pipeInputs),
  );
  const [columnValue, setColumnValue] = useState(() =>
    getDefaultOption(config.column, config.inputs),
  );
  const [rowValue, setRowValue] = useState(() =>
    getDefaultOption(config.row, config.inputs),
  );
  const [valueValue, setValueValue] = useState(() =>
    getDefaultOption(config.value, config.inputs, config.outputs),
  );

  const handleReset = () => {
    setInputs(() => getDefaultValues(config.inputs));
    setPipeInputs(() => getDefaultValues(config.pipeInputs));
    setColumnValue(() => getDefaultOption(config.column, config.inputs));
    setRowValue(() => getDefaultOption(config.row, config.inputs));
    setValueValue(() =>
      getDefaultOption(config.row, config.inputs, config.outputs),
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
      <p>
        Specify the value for each element and run the reactions. Some
        ingredients are only required for specific values, such as pipe
        dimensions are only needed for calculating corrosion rate. These
        inputs are hidden until required.
      </p>
      <Row>
        <Col>
          <ChemInputs
            inputs={config.inputs}
            values={inputs}
            onChange={setInputs}
          />
        </Col>
        <Col>
          <Autocomplete
            label="Column parameter"
            options={config.inputs}
            optionLabel={(x) => x.text}
            initialSelectedOptions={[columnValue]}
            onOptionsChange={(newValue) =>
              setColumnValue(newValue.selectedItems[0])
            }
            hideClearButton={true}
          />
          <Autocomplete
            label="Row parameter"
            options={config.inputs}
            optionLabel={(x) => x.text}
            initialSelectedOptions={[rowValue]}
            onOptionsChange={(newValue) =>
              setRowValue(newValue.selectedItems[0])
            }
            hideClearButton={true}
          />
          <Autocomplete
            label="Value parameter"
            options={config.outputs}
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
              inputs={config.pipeInputs}
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
