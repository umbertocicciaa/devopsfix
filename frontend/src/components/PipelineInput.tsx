import React from 'react';
import { APP_COPY } from '../config/appCopy';
import { INPUT_MODES, type InputMode } from '../config/appConfig';

interface PipelineInputProps {
  value: string;
  onChange: (value: string) => void;
  repositoryUrl: string;
  onRepositoryUrlChange: (url: string) => void;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
}

export const PipelineInput: React.FC<PipelineInputProps> = ({ 
  value, 
  onChange, 
  repositoryUrl, 
  onRepositoryUrlChange,
  inputMode,
  onInputModeChange
}) => {
  return (
    <div className="pipeline-input">
      <div style={{ marginBottom: '15px' }}>
        <h3>{APP_COPY.pipelineInput.heading}</h3>
        
        {/* Input Mode Selector */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={() => onInputModeChange(INPUT_MODES.repository)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: inputMode === INPUT_MODES.repository ? 'bold' : 'normal',
              color: inputMode === INPUT_MODES.repository ? 'white' : '#333',
              backgroundColor: inputMode === INPUT_MODES.repository ? '#4CAF50' : '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {APP_COPY.pipelineInput.modes.repository}
          </button>
          <button
            onClick={() => onInputModeChange(INPUT_MODES.manual)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: inputMode === INPUT_MODES.manual ? 'bold' : 'normal',
              color: inputMode === INPUT_MODES.manual ? 'white' : '#333',
              backgroundColor: inputMode === INPUT_MODES.manual ? '#4CAF50' : '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {APP_COPY.pipelineInput.modes.manual}
          </button>
        </div>
      </div>

      {inputMode === INPUT_MODES.repository ? (
        <div>
          <label htmlFor="repository-url" style={{ display: 'block', marginBottom: '8px' }}>
            <strong>{APP_COPY.pipelineInput.repository.label}</strong>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              {APP_COPY.pipelineInput.repository.helper}
            </p>
          </label>
          <input
            type="text"
            id="repository-url"
            value={repositoryUrl}
            onChange={(e) => onRepositoryUrlChange(e.target.value)}
            placeholder={APP_COPY.pipelineInput.repository.placeholder}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            <strong>{APP_COPY.pipelineInput.repository.supportedFormatsLabel}</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              {APP_COPY.pipelineInput.repository.supportedFormats.map((format) => (
                <li key={format}>{format}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="pipeline-content">
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              {APP_COPY.pipelineInput.manual.helper}
            </p>
          </label>
          <textarea
            id="pipeline-content"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={APP_COPY.pipelineInput.manual.placeholder}
            rows={15}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
        </div>
      )}
    </div>
  );
};
