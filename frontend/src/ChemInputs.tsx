import { ChangeEvent } from "react";
import { Input, Label } from "@equinor/eds-core-react";

interface ChemInputProps {
  inputs: [string: number];
  onChange: (inputs: [string: number]) => void;
}

function ChemInputs({ inputs, onChange }: ChemInputProps) {
  const fields = Object.entries(inputs).map(([key, value]) => (
    <div>
      <Label htmlFor={key} label={key} />
      <Input
        name={key}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const value = parseFloat(event.target.value);
          if (value >= 0.0) onChange({ ...inputs, [key]: value });
        }}
      />
    </div>
  ));
  return <div>{fields}</div>;
}

export { ChemInputs };
