import React from 'react';

interface Props {
  result: string;
}

const Result: React.FC<Props> = ({ result }) => {
  return (
    <div>
      <h2>Analysis Result:</h2>
      <p>{result}</p>
    </div>
  );
};

export default Result;
