import { useEffect, useState } from "react";
import Plot from "react-plotly.js";

import { baseUrl } from "./util";
import { SubmitParams } from "./Form";

let counter = 0;

interface OutputProps {
  inputs: SubmitParams | null;
}

function Output({ inputs }: OutputProps) {
  if (inputs === null) return;

  const [state, setState] = useState(null);

  useEffect(() => {
    if (state !== null) return;

    fetch(`${baseUrl}api/run_matrix`, {
      method: "POST",
      body: JSON.stringify(inputs),
    })
      .then((resp) => resp.json())
      .then(setState)
      .catch(console.error);
  }, [state]);

  const url = `${baseUrl}api/run_matrix`;

  if (state === null) return;

  let layout = {
    yaxis: {
      autorange: "reversed",
    },
    annotations: [],
  };

  for (var i = 0; i < state.plot.y.length; i++) {
    for (var j = 0; j < state.plot.x.length; j++) {
      const value = state.plot.z[i][j];

      let color = value < 5 ? "white" : "black";

      layout.annotations.push({
        xref: "x1",
        yref: "y1",
        x: state.plot.x[j],
        y: state.plot.y[i],
        text: value.toString(),
        showarrow: false,
        font: {
          size: 12,
          color: color,
        },
      });
    }
  }

  const heatmap = {
    x: state.plot.x,
    y: state.plot.y,
    z: state.plot.z,
    type: "heatmap",
  };

  return <Plot data={[heatmap]} layout={layout} />;
}

export { Output };
