import { useState } from "react";

import { ChemInputs } from "./ChemInputs";
import { Autocomplete, Button } from "@equinor/eds-core-react";

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
    <div>
      <ChemInputs inputs={inputs} onChange={setInputs} />
      <Autocomplete
        label="Column parameter"
        options={inputKeys}
        initialSelectedOptions={[columnValue]}
        onInputChange={(newValue) => setColumnValue(newValue)}
        hideClearButton={true}
      />
      <div>
        <Autocomplete
          label="Row parameter"
          options={inputKeys}
          initialSelectedOptions={[rowValue]}
          onInputChange={(newValue) => setRowValue(newValue)}
          hideClearButton={true}
        />
      </div>
      <div>
        <Autocomplete
          label="Value parameter"
          options={outputKeys}
          initialSelectedOptions={[valueValue]}
          onInputChange={(newValue) => setValueValue(newValue)}
          hideClearButton={true}
        />
      </div>
      {pipeParams}
      <Button onClick={handleSubmit}>Run Reactions</Button>
    </div>
  );
}

export { Form, SubmitParams };
