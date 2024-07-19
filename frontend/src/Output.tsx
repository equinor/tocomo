import { useEffect, useState } from "react";
import Plot from "react-plotly.js";

import { baseUrl } from "./util";
import { SubmitParams } from "./Form";

interface OutputProps {
  inputs: SubmitParams | null;
}

interface StateData {
  plot: {
    x: number[];
    y: number[];
    z: number[][];
  };
}

function Output({ inputs }: OutputProps) {
  if (inputs === null) return;

  const [state, setState] = useState<StateData | null>(null);

  useEffect(() => {
    console.log("I'm fetching!");
    fetch(`${baseUrl}api/run_matrix`, {
      method: "POST",
      body: JSON.stringify(inputs),
    })
      .then((resp) => resp.json())
      .then(setState)
      .catch(console.error);
  }, [inputs]);

  if (state === null) return;

  let layout: Partial<Plotly.Layout> = {
    yaxis: {
      autorange: "reversed",
    },
    annotations: [],
  };

  for (var i = 0; i < state.plot.y.length; i++) {
    for (var j = 0; j < state.plot.x.length; j++) {
      const value = state.plot.z[i][j];

      let color = value < 5 ? "white" : "black";

      layout.annotations?.push({
        /* xref: "x1",
         * yref: "y1", */
        x: state.plot.x[j],
        y: state.plot.y[i],
        text: value.toPrecision(2),
        showarrow: false,
        font: {
          size: 12,
          color: color,
        },
      });
    }
  }

  return <Plot data={[{ ...state.plot, type: "heatmap" }]} layout={layout} />;
}

export { Output };
