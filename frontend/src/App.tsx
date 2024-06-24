import { useState, FormEvent } from 'react';

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
  H2O: 0,
  O2: 0,
  SO2: 0,
  NO2: 0,
  H2S: 0,
  H2SO4: 0,
  HNO3: 0,
  NO: 0,
};

const baseURL: string = `https://backend-c2d2-web-portal-test-dev.playground.radix.equinor.com`
// const baseURL: string = `http://localhost:5005`

function App() {
  const [inputs, setInputs] = useState<ChemicalValues>(defaultValues);
  const [output, setOutput] = useState<ChemicalValues>(defaultValues);

  const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
    const { name, valueAsNumber } = event.currentTarget;
    setInputs(prev => ({
      ...prev,
      [name]: isNaN(valueAsNumber) ? 0 : valueAsNumber  // Use 0 if the value is not a number
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();  // Prevent the form from submitting traditionally
    const queryParams = new URLSearchParams(Object.entries(inputs) as [string, string][]).toString();
    const url = `${baseURL}/run_reactions?${queryParams}`;
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
        {Object.entries(defaultValues).map(([key, initialValue]) => (
          <div key={key}>
            <label>
              {`${key}: `}
              <input
                type="number"
                name={key}
                value={initialValue}
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
