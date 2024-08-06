import { useContext, useEffect, useState } from "react";

import Row from "react-bootstrap/Row";

import { baseUrl } from "./util";
import { SubmitParams } from "./Form";
import Plot from "react-plotly.js";
import { ConfigContext } from "./Config";

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
  const config = useContext(ConfigContext);

  const columns = Object.keys(config.molecules);
  const headers = columns.flatMap((x, i) => (
    <th key={i} scope="col">
      {config.molecules[x]}
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

  return (<>
    <p>
      Contains the concentrations for the point clicked in the heatmap. In
      addition to listing the initial and final concentration we include
      aggregated values for each element. If an element is a product and an
      input said element could be 0 at both initial and final condition, but
      still have been produced before being consumed. Hence we display the total
      amount of each element that has been produced including as intermediate
      results.
    </p>
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
  </>);
}

function Details({ resultData }: { resultData: ResultData }) {
  const config = useContext(ConfigContext);

  const initialRow = (
    <tr>
      <td></td>
      <td></td>
      {Object.keys(config.molecules).flatMap((m, i) => (
        <td key={i}>{resultData.initial[m].toPrecision(4)}</td>
      ))}
    </tr>
  );

  const rows = resultData.steps.flatMap((step) => {
    return (
      <tr>
        <td>
          <span className="badge bg-secondary">{step.reactionIndex}</span>&nbsp;
          {config.reactions[step.reactionIndex]}
        </td>
        <td>{step.multiplier.toString()}</td>
        {Object.keys(config.molecules).flatMap((m, i) => (
          <td key={i}>{step.posterior[m].toPrecision(4)}</td>
        ))}
      </tr>
    );
  });

  return (
    <table className="table">
      <tbody>
        <tr>
          <th>Reaction</th>
          <th>Multiplier</th>
          {Object.keys(config.molecules).flatMap((m, i) => (
            <th key={i}>{config.molecules[m]}</th>
          ))}
        </tr>
        {initialRow}
        {rows}
      </tbody>
    </table>
  );
}

function Output({ inputs }: OutputProps) {
  const config = useContext(ConfigContext);
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

    const plotData: Partial<Plotly.PlotData>[] = Object.keys(
      config.molecules,
    ).flatMap((m) => {
      return {
        y: [resultData.initial[m]].concat(
          resultData.steps.flatMap((s) => s.posterior[m]),
        ),
        name: config.molecules[m],
        type: "scatter",
      };
    });
    const plotinfo = (
      <p>
        The plot shows the concentration of each element after
        a reaction has been applied. The first and last set of values on the y
        axis represents the initial and final conditions. The plot is
        interactive and you can hide individual lines (by clicking on their
        legend), and hover to get exact values.
      </p>)

    const detailedInfoDesc = (
      <p>
        Here each reaction that is applied is listed together with the
        concentration after the reaction is applied. It is possible to follow
        the concentration values one after another by including the multiplier.
      </p>)

    moreInfo = (
      <>
        <Row>
          <Table resultData={resultData} />
        </Row>
        <Row>
          {plotinfo}
          <Plot data={plotData} layout={{}} />
        </Row>
        <Row>
          {detailedInfoDesc}
          <Details resultData={resultData} />
        </Row>
      </>
    );
  }

  return (
    <>
      <p>
        The heatmap contains the value of the element specified above with the
        axes specified by row and column. Click on one of the values to get
        detailed information.
      </p>
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
