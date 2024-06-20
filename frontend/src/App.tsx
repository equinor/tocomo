import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`http://localhost:5005/run_reactions?=H2O=30&O2=10&SO2=0&NO2=1.5&H2S=3&H2SO4=0&HNO3=0&NO=0`)
      .then(response => response.json())
      .then(data => setMessage(data.H2O));
  }, []);

  return (
    <>
      <h1>CO2 spec demo</h1>
      <>{'H2O content after reactions is ' + message}</>
    </>
  )
}

export default App
