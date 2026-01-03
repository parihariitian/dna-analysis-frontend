import React, { useState, useEffect } from 'react';

function App() {
  const [dnaSequence, setDnaSequence] = useState('');
  const [result, setResult] = useState<{ rna: string, protein: string, disease: string } | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ sequence: string; result: string; time: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Load history from localStorage when app starts
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('dnaHistory') || '[]');
    setHistory(savedHistory);
  }, []);

  // Validate DNA sequence
  const isValidDNA = (sequence: string) => /^[ATGC]+$/i.test(sequence);

  // Calculate GC Content
  const calculateGCContent = (sequence: string) => {
    const gcCount = (sequence.match(/[GC]/gi) || []).length;
    return ((gcCount / sequence.length) * 100).toFixed(2);
  };

  // Get Reverse Complement
  const getReverseComplement = (sequence: string) => {
    const complementMap: { [key: string]: string } = { A: "T", T: "A", G: "C", C: "G" };
    return sequence.split("").reverse().map(base => complementMap[base] || base).join("");
  };

  // Save history in localStorage
  const saveToHistory = (sequence: string, result: any) => {
    const newEntry = { sequence, result: JSON.stringify(result), time: new Date().toLocaleString() };
    const updatedHistory = [...history, newEntry].slice(-5); // Keep only last 5 records
    localStorage.setItem('dnaHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  // Handle DNA input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setDnaSequence(value);

    if (/[^ATGC]/.test(value)) {
      setError('Invalid character! Only A, T, G, and C are allowed.');
    } else {
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dnaSequence) {
      setError("❗ Please enter a DNA sequence.");
      return;
    }
    if (error) return;

    setLoading(true);
    try {
      const response = await fetch('https://dna-analysis.onrender.com/analyze_dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dna: dnaSequence }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze DNA');
      }

      const data = await response.json();
      setResult(data);
      saveToHistory(dnaSequence, data);
    } catch (err) {
      setError(" Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Download result as a file
  const downloadResult = () => {
    if (!result) return;
    const element = document.createElement('a');
    const file = new Blob(
      [
        `DNA Sequence: ${dnaSequence}\n` +
        `RNA Sequence: ${result.rna}\n` +
        `Protein: ${result.protein}\n` +
        `Disease Prediction: ${result.disease}\n` +
        `GC Content: ${calculateGCContent(dnaSequence)}%\n` +
        `Reverse Complement: ${getReverseComplement(dnaSequence)}`
      ], 
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = 'dna_analysis.txt';
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial", marginTop: "50px" }}>
      <h1>🧬 DNA Analysis</h1>
      <form onSubmit={handleSubmit}>
        <label>Enter DNA Sequence:</label>
        <input 
          type="text" 
          value={dnaSequence} 
          onChange={handleChange} 
          placeholder="ATGC..."
          required
          style={{ margin: "10px", padding: "5px" }}
        />
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <br />
        <button type="submit" disabled={!!error || loading} style={{ padding: "5px 10px", cursor: "pointer" }}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
          <h2>📝 Analysis Result:</h2>
          <p>🧬 RNA Sequence: {result.rna}</p>
          <p>🔬 Protein: {result.protein}</p>
          <p>⚠️ Disease Prediction: {result.disease}</p>
          <p>📊 GC Content: {calculateGCContent(dnaSequence)}%</p>
          <p>🔄 Reverse Complement: {getReverseComplement(dnaSequence)}</p>
          <button onClick={downloadResult} style={{ marginTop: "10px", padding: "5px 10px", cursor: "pointer" }}>
            📥 Download Result
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "30px", padding: "10px", border: "1px solid #ccc" }}>
          <h2>📜 History (Last 5 Searches):</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index}>{item.sequence} - {item.result} ({item.time})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;


  
