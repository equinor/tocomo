import { ChangeEvent } from "react";
import { TextField } from "@equinor/eds-core-react";

export interface FormControl {
  name: string;
  text: string;
  init?: number;
  needsPipeInput: boolean;
}

interface ChemInputProps {
  inputs: FormControl[];
  values: { [key: string]: number };
  onChange: (values: { [key: string]: number }) => void;
}

export function ChemInputs({ inputs, values, onChange }: ChemInputProps) {
  const fields = inputs.flatMap((input) => (
    <div key={input.name}>
      <TextField
        id={Math.random().toString()}
        label={input.text}
        name={input.name}
        value={values[input.name]}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (!event.target.value) {
            onChange({ ...values, [input.name]: 0 });
            return;
          }

          const value = parseFloat(event.target.value);
          if (value >= 0.0) onChange({ ...values, [input.name]: value });
        }}
      />
    </div>
  ));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {fields}
    </div>
  );
}
