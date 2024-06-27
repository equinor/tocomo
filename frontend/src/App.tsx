import { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';

interface ChemicalValues {
  H2O: number;
  O2: number;
  SO2: number;
  NO2: number;
  H2S: number;
  H2SO4: number;
  HNO3: number;
  NO: number;
}

const defaultValues: ChemicalValues = {
  H2O: 40,
  O2: 30,
  SO2: 0,
  NO2: 20,
  H2S: 10,
  H2SO4: 0,
  HNO3: 0,
  NO: 0,
};

//const baseURL: string = `https://backend-c2d2-web-portal-test-dev.playground.radix.equinor.com`
//const baseURL: string = `https://frontend-c2d2-web-portal-test-dev.playground.radix.equinor.com`
//const baseURL: string = `http://localhost:5005`
//const baseURL: string = `http://localhost:3000`
const baseURL: string = ""

function App() {
  const [input, setInput] = useState<ChemicalValues>(defaultValues);
  const [output, setOutput] = useState<ChemicalValues>(defaultValues);

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
    const url = `${baseURL}/api/run_reactions?${queryParams}`;
    fetch(url)
      .then(response => response.json())
      .then(data => setOutput(data))
      .catch(error => console.error('Error fetching data:', error)); // Handle any errors
  };

  return (
    <>
      <h1>CO2 spec demo</h1>
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

      <div>
        <h2>Notes:</h2>
        <pre className="notes">
          {`
Here are the reactions that are currently implemented:

  1: "NO2 + SO2 + H2O -> NO + H2SO4"
  2: "2 NO + O2 -> 2 NO2"
  3: "H2S + 3 NO2 -> SO2 + H2O + 3 NO"
  4: "3 NO2 + H2O -> 2 HNO3 + NO"

Pseudo algorithm:

loop until no more reactions possible:
  do reaction 3 if possible
  else do reaction 2 if possible
  else do reaction 1 if possible
  else do reaction 4 if possible
  else stop the loop
`}
        </pre>
      </div>   
    </>
  );
}

export default App;
