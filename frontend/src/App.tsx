import { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';
import Dropdown from './DropdownComponent';

interface InputChemicalValues {
  H2O: number;
  O2: number;
  SO2: number;
  NO2: number;
  H2S: number;
}

const defaultInputValues: InputChemicalValues = {
  H2O: 40,
  O2: 30,
  SO2: 0,
  NO2: 20,
  H2S: 10,
};

interface OutputChemicalValues {
  H2O: number;
  O2: number;
  SO2: number;
  NO2: number;
  H2S: number;
  H2SO4: number;
  HNO3: number;
  NO: number;
  HNO2: number;
  S8: number;
}

const defaultOutputValues: OutputChemicalValues = {
  H2O: 0,
  O2: 0,
  SO2: 0,
  NO2: 0,
  H2S: 0,
  H2SO4: 0,
  HNO3: 0,
  NO: 0,
  HNO2: 0,
  S8: 0,
};

const baseURL: string = ""

function App() {
  const [input, setInput] = useState<InputChemicalValues>(defaultInputValues);
  const [output, setOutput] = useState<OutputChemicalValues>(defaultOutputValues);

  const [row, setRow] = useState("");
  const [column, setColumn] = useState("");
  const [valuename, setValuename] = useState("");

  const [matrix_url, setMatrix_url] = useState("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInput(prevValues => ({
      ...prevValues,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();  // Prevent the form from submitting traditionally
    const queryParams = new URLSearchParams(Object.entries(input) as [string, string][]).toString();
    setMatrix_url(`${baseURL}/api/run_matrix?row=${row}&column=${column}&values=${valuename}&${queryParams}`);
    const url = `${baseURL}/api/run_reactions?${queryParams}`;
    fetch(url)
      .then(response => response.json())
      .then(data => setOutput(data))
      .catch(error => console.error('Error fetching data:', error)); // Handle any errors
  };

  const handleRowSelect = (value: string) => {
    setRow(value)
  };

  const handleColumnSelect = (value: string) => {
    setColumn(value)
  };

  const handleValuenameSelect = (value: string) => {
    setValuename(value)
  };

  const options = Object.keys(defaultInputValues).map(key => ({
    value: key,
    label: key,
  }));
  const outputoptions = Object.keys(defaultOutputValues).map(key => ({
    value: key,
    label: key,
  }));
  return (
    <>
      <h1>CO2 spec demo</h1>
      <Dropdown
        label="column parameter"
        options={options}
        placeholder="Select an option"
        onSelect={handleColumnSelect}
      />
      <Dropdown
        label="row parameter"
        options={options}
        placeholder="Select an option"
        onSelect={handleRowSelect}
      />
      <Dropdown
        label="Value Parameter"
        options={outputoptions}
        placeholder="Select an option"
        onSelect={handleValuenameSelect}
      />
      <form onSubmit={handleSubmit}>
        <table className="input-table">
          <tbody>
            {Object.entries(input).map(([key, value]) => (
              <tr key={key}>
                <td><label htmlFor={key}>{key}</label></td>
                <td>
                  <input
                    type="number"
                    id={key}
                    name={key}
                    value={value}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit">Run Reactions</button>
      </form>
      {output && (
        <div>
          <h2>Results:</h2>
          <table className="results-table">
            <tbody>
              {Object.entries(output).map(([key, value], index) => (
                <tr key={index}>
                  <td>{key}</td>
                  <td>{value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <img src={matrix_url} alt="Seaborn Plot" />
      <div>
        <h2>Notes:</h2>
        <pre className="notes">
          {`
Pseudo algorithm of current implementation

1: NO2 + SO2 + H2O -> NO + H2SO4
2: 2 NO + O2 -> 2 NO2
3: H2S + 3 NO2 -> SO2 + H2O + 3 NO
4: 3 NO2 + H2O -> 2 HNO3 + NO
5: 2 NO2 + H2O-> HNO3 + HNO2        # not used
6: 8 H2S + 4 O2 -> 8 H2O + S8

initial concentrations

loop until no more reactions possible:
  do      reaction 3 if possible
  else do reaction 2 if possible
  else do reaction 1 if possible
  else do reaction 4 if possible
  else do reaction 6 if possible
  else stop the loop

show concentrations when no more reactions possible
`}
        </pre>
      </div>
    </>
  );
}

export default App;
