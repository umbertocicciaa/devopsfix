import React from 'react';
import { APP_COPY } from '../config/appCopy';
import { AnalysisResponse } from '../types';

interface ResultsDisplayProps {
  results: AnalysisResponse | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results) {
    return null;
  }

  const originalPipeline = results.originalPipeline ?? '';
  const improvedPipeline = results.analysis.improvedPipeline ?? '';

  const originalLines = originalPipeline.split(/\r?\n/);
  const improvedLines = improvedPipeline.split(/\r?\n/);
  const lineCount = Math.max(originalLines.length, improvedLines.length);

  const lineEntries = Array.from({ length: lineCount }, (_, index) => ({
    number: index + 1,
    original: originalLines[index] ?? '',
    improved: improvedLines[index] ?? ''
  }));

  const hasChanges = lineEntries.some((entry) => entry.original !== entry.improved);
  const canRenderComparison =
    originalPipeline.trim().length > 0 || improvedPipeline.trim().length > 0;

  return (
    <div className="results-display" style={{ marginTop: '30px' }}>
      <h2>{APP_COPY.results.title}</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>
          {APP_COPY.labels.provider}: {results.provider}
        </h3>
      </div>

      {/* Validation Results */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>{APP_COPY.results.validationTitle}</h3>
        <p style={{ color: results.validation.valid ? 'green' : 'red', fontWeight: 'bold' }}>
          {APP_COPY.results.validationStatusLabel}:{' '}
          {results.validation.valid ? APP_COPY.results.validationValid : APP_COPY.results.validationInvalid}
        </p>
        {results.validation.errors.length > 0 && (
          <div>
            <h4>{APP_COPY.results.validationErrorsTitle}</h4>
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
        <h3>{APP_COPY.results.pipelineStructureTitle}</h3>
        <p>
          <strong>{APP_COPY.results.pipelineTypeLabel}:</strong> {results.parsed.type}
        </p>
        <p>
          <strong>{APP_COPY.results.pipelineStagesLabel}:</strong>{' '}
          {results.parsed.stages.join(', ') || APP_COPY.results.pipelineStagesEmpty}
        </p>
        <p>
          <strong>{APP_COPY.results.pipelineJobsLabel}:</strong> {results.parsed.jobs.length}
        </p>
      </div>

      {/* LLM Analysis */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>{APP_COPY.results.analysisTitle}</h3>
        <p>{results.analysis.analysis}</p>
      </div>

      {/* Suggestions */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>{APP_COPY.results.suggestionsTitle}</h3>
        <ul>
          {results.analysis.suggestions.map((suggestion, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>{suggestion}</li>
          ))}
        </ul>
      </div>

      {/* Fixes */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#e7f3ff' }}>
        <h3>{APP_COPY.results.fixesTitle}</h3>
        <p>{results.analysis.fixes}</p>
      </div>

      {/* Pipeline Comparison */}
      {canRenderComparison ? (
        <div
          style={{
            marginBottom: '20px',
            padding: '20px',
            border: '1px solid #dcdfe3',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 20px rgba(40, 44, 52, 0.05)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{ marginBottom: 0 }}>{APP_COPY.results.comparisonTitle}</h3>
            <p style={{ margin: 0, color: '#5f6368', fontSize: '14px' }}>
              {APP_COPY.results.comparisonSubtitle}
            </p>
            <span
              style={{
                fontSize: '13px',
                color: hasChanges ? '#2e7d32' : '#5f6368',
                fontWeight: hasChanges ? 600 : 400
              }}
            >
              {hasChanges
                ? APP_COPY.results.comparisonChangesNote
                : APP_COPY.results.comparisonNoChangesNote}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginTop: '20px'
            }}
          >
            <div
              style={{
                border: '1px solid #e0e3e8',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#fafafa'
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f0f2f5',
                  borderBottom: '1px solid #e0e3e8',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {APP_COPY.results.comparisonOriginalTitle}
              </div>
              <div
                style={{
                  maxHeight: '360px',
                  overflow: 'auto',
                  padding: '12px 0',
                  fontFamily: `'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace`,
                  fontSize: '13px',
                  lineHeight: 1.5,
                  backgroundColor: '#ffffff'
                }}
              >
                {lineEntries.map((entry) => (
                  <div
                    key={`original-${entry.number}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr',
                      gap: '12px',
                      padding: '2px 16px',
                      backgroundColor:
                        entry.original !== entry.improved ? 'rgba(255, 138, 101, 0.12)' : 'transparent'
                    }}
                  >
                    <span style={{ color: '#9aa0a6', textAlign: 'right' }}>{entry.number}</span>
                    <span style={{ whiteSpace: 'pre-wrap', color: '#202124' }}>
                      {entry.original.trim().length > 0 ? entry.original : '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                border: '1px solid #e0e3e8',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#fafafa'
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#e6f4ea',
                  borderBottom: '1px solid #d0e5d6',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#1b5e20'
                }}
              >
                {APP_COPY.results.comparisonImprovedTitle}
              </div>
              <div
                style={{
                  maxHeight: '360px',
                  overflow: 'auto',
                  padding: '12px 0',
                  fontFamily: `'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace`,
                  fontSize: '13px',
                  lineHeight: 1.5,
                  backgroundColor: '#ffffff'
                }}
              >
                {lineEntries.map((entry) => (
                  <div
                    key={`improved-${entry.number}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr',
                      gap: '12px',
                      padding: '2px 16px',
                      backgroundColor:
                        entry.original !== entry.improved ? 'rgba(129, 199, 132, 0.2)' : 'transparent'
                    }}
                  >
                    <span style={{ color: '#7ba17e', textAlign: 'right' }}>{entry.number}</span>
                    <span style={{ whiteSpace: 'pre-wrap', color: '#1b5e20' }}>
                      {entry.improved.trim().length > 0 ? entry.improved : '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginBottom: '20px',
            padding: '18px',
            border: '1px solid #e0e3e8',
            borderRadius: '6px',
            backgroundColor: '#fafafa',
            color: '#5f6368',
            fontSize: '14px'
          }}
        >
          {APP_COPY.results.comparisonUnavailable}
        </div>
      )}
    </div>
  );
};
