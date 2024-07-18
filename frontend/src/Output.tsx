import { baseUrl } from "./util";

interface SubmitParams {
  inputs: [string: number];
  columnValue: string;
  rowValue: string;
  valueValue: string;
}

interface OutputProps {
  inputs: SubmitParams | null;
}

function Output({ inputs }: OutputProps) {
  if (inputs === null) return;

  const q = JSON.stringify(inputs);
  const url = `${baseUrl}api/run_matrix?q=${q}`;
  return <img src={url} />;
}

export { Output };
