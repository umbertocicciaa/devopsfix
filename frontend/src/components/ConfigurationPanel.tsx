import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ApiError, toApiError } from '../services/errors';

interface ConfigurationPanelProps {
  cicdType: string;
  llmProvider: string;
  onCICDTypeChange: (type: string) => void;
  onLLMProviderChange: (provider: string) => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  cicdType,
  llmProvider,
  onCICDTypeChange,
  onLLMProviderChange
}) => {
  const [providers, setProviders] = useState<string[]>([]);
  const [cicdTypes, setCICDTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setError(null);
        const [providersData, cicdTypesData] = await Promise.all([
          api.getProviders(),
          api.getCICDTypes()
        ]);
        setProviders(providersData);
        setCICDTypes(cicdTypesData);
        
        if (providersData.length > 0 && !llmProvider) {
          onLLMProviderChange(providersData[0]);
        }
        if (cicdTypesData.length > 0 && !cicdType) {
          onCICDTypeChange(cicdTypesData[0]);
        }
      } catch (error) {
        const apiError = error instanceof ApiError ? error : toApiError(error);
        setError(apiError.message);
      }
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="configuration-panel">
      <h3>Configuration</h3>
      {error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          <strong>Failed to load options:</strong> {error}
        </div>
      )}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="cicd-type" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          CI/CD Platform
        </label>
        <select
          id="cicd-type"
          value={cicdType}
          onChange={(e) => onCICDTypeChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          {cicdTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="llm-provider" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          LLM Provider
        </label>
        <select
          id="llm-provider"
          value={llmProvider}
          onChange={(e) => onLLMProviderChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          {providers.map((provider) => (
            <option key={provider} value={provider}>
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
