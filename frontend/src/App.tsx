import { useState, FormEvent, ChangeEvent } from 'react';

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
const baseURL: string = "/api"

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
        {/* Generate input fields for user-defined values */}
        {Object.entries(input).map(([key, value]) => (
          <div key={key}>
            <label>
              {`${key}: `}
              <input
                type="number"
                name={key}
                value={value}
                onChange={handleInputChange}
              />
            </label>
          </div>
        ))}
        <button type="submit">Run Reactions</button>
      </form>
      {output && (
        <div>
          <h2>Results:</h2>
          {/* Show the result after fetching */}
          {Object.entries(output).map(([key, value], index) => (
            <p key={index}>{`${key} content after reactions is ${value.toFixed(2)}`}</p>
          ))}
        </div>
      )}
    </>
  );
}

export default App;
