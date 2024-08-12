import { useContext } from "react";
import { ConfigContext } from "./Config.tsx";
import { Button } from "@equinor/eds-core-react";
import { SubmitParams } from "./Form.tsx";

interface HistoryProps {
  history: SubmitParams[];
  onClear: () => void;
  setInput: (inputs: SubmitParams) => void;
}

export function History(props: HistoryProps) {
  const config = useContext(ConfigContext);

  const inputs: { [key: string]: number } = {};
  for (const input of config.inputs) {
    inputs[input.name] = input.init!;
  }

  const names: { [key: string]: string } = {};
  for (const input of config.inputs) {
    names[input.name] = input.text;
  }

  const onClear = () => {
    localStorage.clear();
    props.onClear();
  };

  return (
    <>
      <Button.Toggle vertical>
        {props.history.flatMap((hist, index) => {
          return (
            <Button key={index} onClick={() => props.setInput(hist)}>
              {Object.entries(hist.inputs).flatMap(([key, val]) => (
                <span>{`${names[key]}: ${val}`}</span>
              ))}
            </Button>
          );
        })}
        <Button color="danger" variant="outlined" onClick={onClear}>
          Clear
        </Button>
      </Button.Toggle>
    </>
  );
}
