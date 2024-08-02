import React, { createContext, useEffect, useState } from "react";
import { FormControl } from "./ChemInputs";
import { baseUrl } from "./util";

export interface Config {
  inputs: FormControl[];
  pipeInputs: FormControl[];
  outputs: FormControl[];
  column: string;
  row: string;
  value: string;
  molecules: { [key: string]: string };
  reactions: { [key: string]: string };
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
};

export const ConfigContext = createContext<Config>(defaultConfig);

type Child = React.ReactElement<{ config: Config }, string>;

export function Config({ children }: { children: Child[] }) {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    let ignore = false;
    if (config !== null) return;

    fetch(`${baseUrl}api/form_config`)
      .then((resp) => resp.json())
      .then((data) => {
        if (!ignore) setConfig(data);
      })
      .catch(console.error);

    return () => {
      ignore = true;
    };
  }, [config]);

  if (config === null) {
    return <pre>Loading!</pre>;
  } else {
    return (
      <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
    );
  }
}
