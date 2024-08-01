import Color from "colorjs.io";

const startColor = new Color("blue");
const endColor = new Color("red");
const colorRange = startColor.range(endColor);

interface Grid {
  z: number[][];
  x: number[];
  y: number[];
}

interface HeatmapProps {
  grid: Grid;
  onClick?: (x: number, y: number, grid: Grid) => void;
}

function getMinMax(cells: number[][]): number[] {
  let min = Infinity;
  let max = -Infinity;

  cells.forEach((row) => {
    row.forEach((val) => {
      if (val < min) min = val;
      if (val > max) max = val;
    });
  });

  return [min, max];
}

function Heatmap({ grid }: HeatmapProps) {
  const rows = [];

  const [min, max] = getMinMax(grid.z);
  const r = (x: number) => (x - min) / (max - min);
  const calc = (x: number) => colorRange(r(x));

  for (let i = 0; i < grid.y.length; i++) {
    const cells = [];
    for (let j = 0; j < grid.x.length; j++) {
      const color = r(grid.z[i][j]) < 0.5 ? "white" : "black";
      cells.push(
        <td
          key={`${i},${j}`}
          style={{ backgroundColor: `${calc(grid.z[i][j])}`, color }}
        >
          {grid.z[i][j]}
        </td>,
      );
    }
    rows.push(<tr key={i}>{cells}</tr>);
  }

  return (
    <table className="text-center">
      <tbody>{rows}</tbody>
    </table>
  );
}

export default Heatmap;
