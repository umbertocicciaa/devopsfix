import React, { useEffect, useState } from 'react';
import './App.css';
import { PipelineInput } from './components/PipelineInput';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { APP_COPY } from './config/appCopy';
import {
  CICD_TYPES,
  INPUT_MODES,
  LLM_PROVIDERS,
  type CICDTypeId,
  type InputMode,
  type LLMProviderId
} from './config/appConfig';
import { analyzePipeline } from './services/analysisService';
import { AppError, toAppError } from './services/errors';
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from './services/storage';
import { AnalysisResponse } from './types';

function App() {
  const [pipelineContent, setPipelineContent] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>(INPUT_MODES.repository);
  const [cicdType, setCICDType] = useState<CICDTypeId>(CICD_TYPES[0].id);
  const [llmProvider, setLLMProvider] = useState<LLMProviderId>(LLM_PROVIDERS[0].id);
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey(LLM_PROVIDERS[0].id));
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(getStoredApiKey(llmProvider));
  }, [llmProvider]);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setStoredApiKey(llmProvider, value);
  };

  const handleApiKeyClear = () => {
    clearStoredApiKey(llmProvider);
    setApiKey('');
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await analyzePipeline({
        pipelineContent: inputMode === INPUT_MODES.manual ? pipelineContent : undefined,
        repositoryUrl: inputMode === INPUT_MODES.repository ? repositoryUrl : undefined,
        cicdType,
        llmProvider,
        inputMode,
        config: {
          apiKey
        }
      });
      setResults(response);
      
      // If CI/CD type was auto-detected, update the state
      if (response.detectedCICDType && inputMode === INPUT_MODES.repository) {
        setCICDType(response.detectedCICDType as CICDTypeId);
      }
    } catch (err) {
      const apiError = err instanceof AppError ? err : toAppError(err);
      let detailsNote: string | null = null;

      if (apiError.details && typeof apiError.details === 'object') {
        const details = apiError.details as { missing?: unknown };
        if (Array.isArray(details.missing) && details.missing.length > 0) {
          detailsNote = `${APP_COPY.labels.missingPrefix}: ${details.missing.join(', ')}`;
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
        <h1>{APP_COPY.app.title}</h1>
        <p>{APP_COPY.app.subtitle}</p>
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
              apiKey={apiKey}
              onCICDTypeChange={setCICDType}
              onLLMProviderChange={setLLMProvider}
              onApiKeyChange={handleApiKeyChange}
              onApiKeyClear={handleApiKeyClear}
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
              {loading ? APP_COPY.actions.analyzing : APP_COPY.actions.analyze}
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
            <strong>{APP_COPY.labels.error}:</strong> {error}
          </div>
        )}

        <ResultsDisplay results={results} />
      </div>
    </div>
  );
}

export default App;
