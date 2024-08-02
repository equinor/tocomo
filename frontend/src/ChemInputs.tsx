import { ChangeEvent } from "react";
import { Input, Label } from "@equinor/eds-core-react";

export interface FormControl {
  name: string;
  text: string;
  init?: number;
  needsPipeInput: boolean;
}

interface ChemInputProps {
  inputs: FormControl[];
  values: [string: number];
  onChange: (values: [string: number]) => void;
}

export function ChemInputs({ inputs, values, onChange }: ChemInputProps) {
  const fields = inputs.flatMap((input) => (
    <div key={input.name}>
      <Label htmlFor={input.name} label={input.text} />
      <Input
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
  return <div>{fields}</div>;
}
