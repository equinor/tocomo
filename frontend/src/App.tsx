import { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';
import { Autocomplete } from '@equinor/eds-core-react';

interface InputChemicalValues {
  H2O: number;
  O2: number;
  SO2: number;
  NO2: number;
  H2S: number;
  inner_diameter: number;
  drop_out_length: number;
  flowrate: number;
}

const defaultInputValues: InputChemicalValues = {
  H2O: 40,
  O2: 30,
  SO2: 0,
  NO2: 20,
  H2S: 10,
  inner_diameter: 30,
  drop_out_length: 1000,
  flowrate: 20,
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
  HNO3_corrosion: number,
  H2SO4_corrision: number,
  corrosion_rate: number,
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
  HNO3_corrosion: 0,
  H2SO4_corrision: 0,
  corrosion_rate: 0,
};

const baseURL: string = ""

function App() {
  const [input, setInput] = useState<InputChemicalValues>(defaultInputValues);
  const [output, setOutput] = useState<OutputChemicalValues>(defaultOutputValues);

  const [row, setRow] = useState("");
  const [column, setColumn] = useState("");
  const [valuename, setValuename] = useState("");

  const [matrix_url, setMatrix_url] = useState("");
  const [csv_url, setCSV_url] = useState("");

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
    setCSV_url(`${baseURL}/api/export_csv?row=${row}&column=${column}&values=${valuename}&${queryParams}`);
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

  async function downloadCSV(endpoint: string, filename: string) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          // Add any required headers here
        }
      });

      if (response.status === 200) {
        // Retrieve the CSV from the response
        let csvText = await response.text();

        // Remove the enclosing double quotes
        csvText = csvText.replace(/^"|"$/g, '');

        // Replace escaped newlines with actual newline characters
        csvText = csvText.replace(/\\n/g, '\n');

        // Convert the CSV text to a Blob with a MIME type of 'text/csv'
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });

        // Create a link and trigger the download
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename); // Any filename you want to give it
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        console.error('Error fetching CSV:', response.status);
        // You may want to handle any errors, e.g., showing an alert to the user
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      // Handle the error
    }
  }

  const inputKeys: string[] = Object.keys(defaultInputValues);
  const outputKeys: string[] = Object.keys(defaultOutputValues);
  
  return (
    <>
      <h1>CO2 spec demo</h1>
      <Autocomplete
        label="Column parameter"
        options={inputKeys}
        onInputChange={handleColumnSelect}
        hideClearButton={true}
        autoWidth={true}
      />
      <Autocomplete
        label="Row parameter"
        options={inputKeys}
        onInputChange={handleRowSelect}
        hideClearButton={true}
        autoWidth={true}
      />
      <Autocomplete
        label="Value parameter"
        options={outputKeys}
        onInputChange={handleValuenameSelect}
        hideClearButton={true}
        autoWidth={true}
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
      {output && (<img src={matrix_url} alt="Seaborn Plot" />)}
      <button onClick={() => downloadCSV(csv_url, 'export.csv')}>
        Download CSV
      </button>
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
