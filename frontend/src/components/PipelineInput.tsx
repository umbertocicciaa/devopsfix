import React from 'react';

interface PipelineInputProps {
  value: string;
  onChange: (value: string) => void;
  repositoryUrl: string;
  onRepositoryUrlChange: (url: string) => void;
  inputMode: 'manual' | 'repository';
  onInputModeChange: (mode: 'manual' | 'repository') => void;
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
        <h3>Pipeline Configuration</h3>
        
        {/* Input Mode Selector */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={() => onInputModeChange('repository')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: inputMode === 'repository' ? 'bold' : 'normal',
              color: inputMode === 'repository' ? 'white' : '#333',
              backgroundColor: inputMode === 'repository' ? '#4CAF50' : '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            📁 From Repository
          </button>
          <button
            onClick={() => onInputModeChange('manual')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: inputMode === 'manual' ? 'bold' : 'normal',
              color: inputMode === 'manual' ? 'white' : '#333',
              backgroundColor: inputMode === 'manual' ? '#4CAF50' : '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            ✏️ Manual Paste
          </button>
        </div>
      </div>

      {inputMode === 'repository' ? (
        <div>
          <label htmlFor="repository-url" style={{ display: 'block', marginBottom: '8px' }}>
            <strong>Repository URL</strong>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              Enter a direct link to your pipeline file (GitHub, GitLab, or Bitbucket)
            </p>
          </label>
          <input
            type="text"
            id="repository-url"
            value={repositoryUrl}
            onChange={(e) => onRepositoryUrlChange(e.target.value)}
            placeholder="https://github.com/owner/repo/blob/main/.github/workflows/ci.yml"
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
            <strong>Supported formats:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>GitHub: https://github.com/owner/repo/blob/branch/path/to/file</li>
              <li>GitLab: https://gitlab.com/owner/repo/-/blob/branch/path/to/file</li>
              <li>Bitbucket: https://bitbucket.org/owner/repo/src/branch/path/to/file</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="pipeline-content">
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              Paste your CI/CD pipeline configuration below
            </p>
          </label>
          <textarea
            id="pipeline-content"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your pipeline configuration here (YAML or Groovy)"
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
