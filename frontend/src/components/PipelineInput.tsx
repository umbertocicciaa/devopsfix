import React from 'react';

interface PipelineInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PipelineInput: React.FC<PipelineInputProps> = ({ value, onChange }) => {
  return (
    <div className="pipeline-input">
      <label htmlFor="pipeline-content">
        <h3>Pipeline Configuration</h3>
        <p>Paste your CI/CD pipeline configuration below</p>
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
  );
};
