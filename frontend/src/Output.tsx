import { useEffect, useState } from "react";

import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";

import { baseUrl } from "./util";
import { SubmitParams } from "./Form";
import Plot from "react-plotly.js";

interface OutputProps {
  inputs: SubmitParams | null;
}

interface StepData {
  posterior: { [key: string]: number };
  multiplier: number;
  reactionIndex: number;
}

interface ResultData {
  initial: { [key: string]: number };
  final: { [key: string]: number };
  aggregated: { [key: string]: number };
  steps: StepData[];
}

interface StateData {
  plot: {
    x: number[];
    y: number[];
    z: number[][];
  };
  resultData: ResultData[][];
}

function Table({ resultData }: { resultData: ResultData }): React.ReactElement {
  const columns = Object.keys(resultData.initial).sort();
  const headers = columns.flatMap((x, i) => (
    <th key={i} scope="col">
      {x}
    </th>
  ));
  const initial = columns.flatMap((x, i) => (
    <td key={i}>{resultData.initial[x].toPrecision(4)}</td>
  ));
  const final = columns.flatMap((x, i) => (
    <td key={i}>{resultData.final[x].toPrecision(4)}</td>
  ));
  const agg = columns.flatMap((x, i) => (
    <td key={i}>{resultData.aggregated[x].toPrecision(4)}</td>
  ));

  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th scope="col"></th>
          {headers}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Initial conditions</th>
          {initial}
        </tr>
        <tr>
          <th scope="row">Final conditions</th>
          {final}
        </tr>
        <tr>
          <th scope="row">Aggregated concentrations</th>
          {agg}
        </tr>
      </tbody>
    </table>
  );
}

function Output({ inputs }: OutputProps) {
  const [state, setState] = useState<StateData | null>(null);
  const [cell, setCell] = useState<number[] | null>(null);

  useEffect(() => {
    if (inputs === null) return;

    fetch(`${baseUrl}api/run_matrix`, {
      method: "POST",
      body: JSON.stringify(inputs),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((json) => {
        if (json.detail !== undefined) {
          throw json;
        } else {
          return json;
        }
      })
      .then(setState)
      .catch(console.error);
  }, [inputs]);

  if (inputs === null || state === null) return;

  const handleClick = (event: Readonly<Plotly.PlotMouseEvent>) => {
    //@ts-expect-error Plotly.PlotDatum's pointIndex is incorrectly typed as
    // number when it should be number[]
    setCell(event.points[0]!.pointIndex);
  };

  const layout: Partial<Plotly.Layout> = {
    autosize: true,
    yaxis: {
      autorange: "reversed",
    },
    annotations: [],
  };

  for (let i = 0; i < state.plot.y.length; i++) {
    for (let j = 0; j < state.plot.x.length; j++) {
      const value = state.plot.z[i][j];
      const color = value < 5 ? "white" : "black";

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

  let moreInfo = null;
  if (cell !== null) {
    const resultData = state.resultData[cell[0]][cell[1]];
    const molecules = Object.keys(resultData.final);

    const plotData: Plotly.PlotData[] = molecules.flatMap((m) => {
      return {
        y: [resultData.initial[m]].concat(
          resultData.steps.flatMap((s) => s.posterior[m]),
        ),
        name: m,
        type: "scatter",
      };
    });

    console.log(plotData);

    moreInfo = (
      <>
        <Row>
          <Table resultData={resultData} />
        </Row>
        <Row>
          <Plot data={plotData} />
        </Row>
      </>
    );
  }

  return (
    <>
      <Row>
        <Plot
          data={[{ ...state.plot, type: "heatmap" }]}
          layout={layout}
          onClick={handleClick}
        />
      </Row>
      {moreInfo}
    </>
  );
}

export { Output };
