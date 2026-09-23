import { createContext } from "react";
import { FormControl } from "./ChemInputs";

export interface Config {
  inputs: FormControl[];
  pipeInputs: FormControl[];
  outputs: FormControl[];
  column: string;
  row: string;
  value: string;
  molecules: { [key: string]: string };
  reactions: { [key: string]: string };
  reaction_order: number[];
}

const defaultConfig: Config = {
  inputs: [],
  pipeInputs: [],
  outputs: [],
  column: "",
  row: "",
  value: "",
  molecules: {},
  reactions: {},
  reaction_order: [],
};

export const ConfigContext = createContext<Config>(defaultConfig);
