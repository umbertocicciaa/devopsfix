import React from 'react';
import { AnalysisResponse } from '../types';

interface ResultsDisplayProps {
  results: AnalysisResponse | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results) {
    return null;
  }

  return (
    <div className="results-display" style={{ marginTop: '30px' }}>
      <h2>Analysis Results</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Provider: {results.provider}</h3>
      </div>

      {/* Validation Results */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Validation</h3>
        <p style={{ color: results.validation.valid ? 'green' : 'red', fontWeight: 'bold' }}>
          Status: {results.validation.valid ? '✓ Valid' : '✗ Invalid'}
        </p>
        {results.validation.errors.length > 0 && (
          <div>
            <h4>Errors:</h4>
            <ul>
              {results.validation.errors.map((error, index) => (
                <li key={index} style={{ color: 'red' }}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pipeline Structure */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Pipeline Structure</h3>
        <p><strong>Type:</strong> {results.parsed.type}</p>
        <p><strong>Stages:</strong> {results.parsed.stages.join(', ') || 'None found'}</p>
        <p><strong>Jobs Count:</strong> {results.parsed.jobs.length}</p>
      </div>

      {/* LLM Analysis */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>AI Analysis</h3>
        <p>{results.analysis.analysis}</p>
      </div>

      {/* Suggestions */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Suggestions for Improvement</h3>
        <ul>
          {results.analysis.suggestions.map((suggestion, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>{suggestion}</li>
          ))}
        </ul>
      </div>

      {/* Fixes */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#e7f3ff' }}>
        <h3>Recommended Fixes</h3>
        <p>{results.analysis.fixes}</p>
      </div>
    </div>
  );
};
