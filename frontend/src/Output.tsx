import { baseUrl } from "./util";
import { SubmitParams } from "./Form";

let counter = 0;

interface OutputProps {
  inputs: SubmitParams | null;
}

function Output({ inputs }: OutputProps) {
  if (inputs === null) return;

  const q = JSON.stringify(inputs);
  const url = `${baseUrl}api/run_matrix?q=${q}&__dummy=${counter}`;
  counter += 1;
  return <img src={url} />;
}

export { Output };
