import React, { useContext } from "react";
import { ConfigContext } from "./Config.tsx";
import { Button } from "@equinor/eds-core-react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

interface CardProps {
  inputs: { [key: string]: string };
  active?: boolean;
}
function Card({ inputs, active }: CardProps) {
  const config = useContext(ConfigContext);

  return <Button aria-label="save action">A</Button>;

  return (
    <Button fullWidth={true}>
      {Object.entries(inputs).flatMap(([key, val], i) => (
        <span className="px-3" key={i}>{`${names[key]}: ${val}`}</span>
      ))}
    </Button>
  );
}

export function History() {
  const config = useContext(ConfigContext);

  const inputs = {};
  for (const input of config.inputs) {
    inputs[input.name] = input.init!;
  }

  const history = [1, 2, 3];

  const names = {};
  for (const input of config.inputs) {
    names[input.name] = input.text;
  }

  return (
    <>
      <Button.Toggle vertical>
        {history.flatMap((i) => {
          return (
            <Button key={i}>
              <Row>
                <Col>
                  {Object.entries(inputs).flatMap(([key, val], i) => (
                    <th>{names[key]}</th>
                  ))}
                </Col>
              </Row>
            </Button>
          );
        })}
      </Button.Toggle>
    </>
  );
}
