import React, { useState } from 'react';
import './App.css';
import { PipelineInput } from './components/PipelineInput';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { api } from './services/api';
import { AnalysisResponse } from './types';
import { ApiError, toApiError } from './services/errors';

function App() {
  const [pipelineContent, setPipelineContent] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [inputMode, setInputMode] = useState<'manual' | 'repository'>('repository');
  const [cicdType, setCICDType] = useState('');
  const [llmProvider, setLLMProvider] = useState('');
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    // Validate input based on mode
    if (inputMode === 'manual' && !pipelineContent.trim()) {
      setError('Please enter pipeline configuration');
      return;
    }
    
    if (inputMode === 'repository' && !repositoryUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.analyzePipeline({
        pipelineContent: inputMode === 'manual' ? pipelineContent : undefined,
        repositoryUrl: inputMode === 'repository' ? repositoryUrl : undefined,
        cicdType,
        llmProvider
      });
      setResults(response);
      
      // If CI/CD type was auto-detected, update the state
      if (response.detectedCICDType && inputMode === 'repository') {
        setCICDType(response.detectedCICDType);
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : toApiError(err);
      let detailsNote: string | null = null;

      if (apiError.details && typeof apiError.details === 'object') {
        const details = apiError.details as { missing?: unknown };
        if (Array.isArray(details.missing) && details.missing.length > 0) {
          detailsNote = `Missing: ${details.missing.join(', ')}`;
        }
      }

      const formatted = apiError.code ? `${apiError.message} (code: ${apiError.code})` : apiError.message;
      setError(detailsNote ? `${formatted}. ${detailsNote}` : formatted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header style={{ 
        backgroundColor: '#282c34', 
        padding: '20px', 
        color: 'white',
        marginBottom: '30px'
      }}>
        <h1>DevOpsFix - CI/CD Pipeline Analyzer</h1>
        <p>Analyze and improve your CI/CD pipelines using AI</p>
      </header>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 300px', 
          gap: '30px',
          marginBottom: '30px'
        }}>
          <div>
            <PipelineInput 
              value={pipelineContent} 
              onChange={setPipelineContent}
              repositoryUrl={repositoryUrl}
              onRepositoryUrlChange={setRepositoryUrl}
              inputMode={inputMode}
              onInputModeChange={setInputMode}
            />
          </div>
          <div>
            <ConfigurationPanel
              cicdType={cicdType}
              llmProvider={llmProvider}
              onCICDTypeChange={setCICDType}
              onLLMProviderChange={setLLMProvider}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: loading ? '#ccc' : '#4CAF50',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '20px'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze Pipeline'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffebee', 
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <ResultsDisplay results={results} />
      </div>
    </div>
  );
}

export default App;
