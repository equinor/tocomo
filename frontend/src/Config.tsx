import React, { useEffect, useState } from "react";
import { type Config, ConfigContext } from "./ConfigContext";
import { baseUrl } from "./util";

type Child = React.ReactElement<{ config: Config }, string>;

export function Config({ children }: { children: Child }) {
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
