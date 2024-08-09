import { useContext, useEffect, useState } from "react";

import Row from "react-bootstrap/Row";

import { baseUrl } from "./util";
import { SubmitParams } from "./Form";
import Plot from "react-plotly.js";
import { ConfigContext } from "./Config";

import { Table, Typography } from "@equinor/eds-core-react";

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

function formatNumber(n: number): string {
  return !n ? "-" : n.toPrecision(4);
}

function ResultTable({
  resultData,
  row,
  column,
}: {
  resultData: ResultData;
  row: number;
  column: number;
}): React.ReactElement {
  const config = useContext(ConfigContext);

  const columns = Object.keys(config.molecules);
  const headers = columns.flatMap((x, i) => (
    <Table.Cell key={i}>{config.molecules[x]}</Table.Cell>
  ));
  const initial = columns.flatMap((x, i) => (
    <Table.Cell key={i}>{formatNumber(resultData.initial[x])}</Table.Cell>
  ));
  const final = columns.flatMap((x, i) => (
    <Table.Cell key={i}>{formatNumber(resultData.final[x])}</Table.Cell>
  ));
  const agg = columns.flatMap((x, i) => (
    <Table.Cell key={i}>{formatNumber(resultData.aggregated[x])}</Table.Cell>
  ));

  const explanation = <></>;

  return (
    <>
      <p></p>
      <Table>
        <Table.Caption>
          <Typography variant="h2">
            {`Details for heatmap cell ${row}, ${column}`}
          </Typography>
          <Typography variant="body_long">
            Table of concentrations for the point clicked in the heatmap. In
            addition to listing the initial and final concentration we include
            aggregated values for each element. If an element is a product and
            an input said element could be 0 at both initial and final
            condition, but still have been produced before being consumed. Hence
            we display the total amount of each element that has been produced
            including as intermediate results.
          </Typography>
        </Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.Cell></Table.Cell>
            {headers}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Initial conditions</Table.Cell>
            {initial}
          </Table.Row>
          <Table.Row>
            <Table.Cell>Final conditions</Table.Cell>
            {final}
          </Table.Row>
          <Table.Row>
            <Table.Cell>Aggregated concentrations</Table.Cell>
            {agg}
          </Table.Row>
        </Table.Body>
      </Table>
    </>
  );
}

function Details({ resultData }: { resultData: ResultData }) {
  const config = useContext(ConfigContext);

  const initialRow = (
    <Table.Row>
      <Table.Cell colSpan={2}></Table.Cell>
      {Object.keys(config.molecules).flatMap((m, i) => (
        <Table.Cell key={i}>{formatNumber(resultData.initial[m])}</Table.Cell>
      ))}
    </Table.Row>
  );

  const rows = resultData.steps.flatMap((step) => {
    return (
      <Table.Row>
        <Table.Cell>
          <span className="badge bg-secondary">{step.reactionIndex}</span>&nbsp;
          {config.reactions[step.reactionIndex]}
        </Table.Cell>
        <Table.Cell>{step.multiplier.toString()}</Table.Cell>
        {Object.keys(config.molecules).flatMap((m, i) => (
          <Table.Cell key={i}>{formatNumber(step.posterior[m])}</Table.Cell>
        ))}
      </Table.Row>
    );
  });

  return (
    <Table id="steps-table">
      <Table.Caption>
        <Typography variant="h2">Reaction steps</Typography>
        <Typography variant="body_short">
          Here each reaction that is applied is listed together with the
          concentration after the reaction is applied. It is possible to follow
          the concentration values one after another by including the
          multiplier.
        </Typography>
      </Table.Caption>
      <Table.Head sticky>
        <Table.Row>
          <Table.Cell>Reaction</Table.Cell>
          <Table.Cell>Multiplier</Table.Cell>
          {Object.keys(config.molecules).flatMap((m, i) => (
            <Table.Cell key={i}>{config.molecules[m]}</Table.Cell>
          ))}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {initialRow}
        {rows}
      </Table.Body>
    </Table>
  );
}

function Output({ inputs }: OutputProps) {
  const config = useContext(ConfigContext);
  const [state, setState] = useState<StateData | null>(null);
  const [cell, setCell] = useState<number[]>([5, 5]);

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
    title: config.molecules[inputs.valueValue],
    yaxis: {
      title: config.molecules[inputs.rowValue],
      autorange: "reversed",
    },
    xaxis: {
      title: config.molecules[inputs.columnValue],
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
        The plot shows the concentration of each element after a reaction has
        been applied. The first and last set of values on the y axis represents
        the initial and final conditions. The plot is interactive and you can
        hide individual lines (by clicking on their legend), and hover to get
        exact values.
      </p>
    );

    moreInfo = (
      <>
        <Row>
          <ResultTable resultData={resultData} row={cell[0]} column={cell[1]} />
        </Row>
        <Row>
          <Plot data={plotData} layout={{}} />
        </Row>
        <Row>
          <Details resultData={resultData} />
        </Row>
      </>
    );
  }

  return (
    <>
      <Typography variant="h2">Results</Typography>
      <Typography variant="body_short">
        The heatmap contains the value of the element specified above with the
        axes specified by row and column. Click on one of the values to get
        detailed information.
      </Typography>
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
