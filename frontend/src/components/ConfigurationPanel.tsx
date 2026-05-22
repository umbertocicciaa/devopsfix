import React, { useState } from 'react';
import { APP_COPY } from '../config/appCopy';
import { CICD_TYPES, LLM_PROVIDERS, type CICDTypeId, type LLMProviderId } from '../config/appConfig';
import { SecuritySettings } from './SecuritySettings';
import { SecurityWarning } from './SecurityWarning';

interface ConfigurationPanelProps {
  cicdType: CICDTypeId;
  llmProvider: LLMProviderId;
  apiKey: string;
  onCICDTypeChange: (type: CICDTypeId) => void;
  onLLMProviderChange: (provider: LLMProviderId) => void;
  onApiKeyChange: (value: string) => void;
  onApiKeyClear: () => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  cicdType,
  llmProvider,
  apiKey,
  onCICDTypeChange,
  onLLMProviderChange,
  onApiKeyChange,
  onApiKeyClear
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const activeProvider = LLM_PROVIDERS.find((provider) => provider.id === llmProvider);

  return (
    <div className="configuration-panel">
      <h3>{APP_COPY.configuration.heading}</h3>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="cicd-type" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          {APP_COPY.configuration.cicdLabel}
        </label>
        <select
          id="cicd-type"
          value={cicdType}
          onChange={(e) => onCICDTypeChange(e.target.value as CICDTypeId)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          {CICD_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="llm-provider" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          {APP_COPY.configuration.providerLabel}
        </label>
        <select
          id="llm-provider"
          value={llmProvider}
          onChange={(e) => onLLMProviderChange(e.target.value as LLMProviderId)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          {LLM_PROVIDERS.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="llm-api-key" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          {activeProvider?.apiKeyLabel ?? APP_COPY.configuration.apiKeyLabel}
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type={showApiKey ? 'text' : 'password'}
            id="llm-api-key"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={APP_COPY.configuration.apiKeyPlaceholder}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            type="button"
            onClick={() => setShowApiKey((previous) => !previous)}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f0f0f0',
              cursor: 'pointer'
            }}
          >
            {showApiKey ? APP_COPY.configuration.apiKeyHide : APP_COPY.configuration.apiKeyShow}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>{APP_COPY.configuration.apiKeyHelper}</span>
          <button
            type="button"
            onClick={onApiKeyClear}
            style={{
              fontSize: '12px',
              color: '#c62828',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {APP_COPY.configuration.apiKeyClear}
          </button>
        </div>
        <SecuritySettings />
        <SecurityWarning />
      </div>
    </div>
  );
};
