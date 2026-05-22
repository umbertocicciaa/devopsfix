export const APP_COPY = {
  app: {
    title: 'DevOpsFix - CI/CD Pipeline Analyzer',
    subtitle: 'Analyze and improve your CI/CD pipelines using AI'
  },
  actions: {
    analyze: 'Analyze Pipeline',
    analyzing: 'Analyzing...'
  },
  labels: {
    error: 'Error',
    missingPrefix: 'Missing',
    provider: 'Provider'
  },
  pipelineInput: {
    heading: 'Pipeline Configuration',
    modes: {
      repository: '📁 From Repository',
      manual: '✏️ Manual Paste'
    },
    repository: {
      label: 'Repository URL',
      helper: 'Enter a direct link to your pipeline file (GitHub, GitLab, or Bitbucket)',
      placeholder: 'https://github.com/owner/repo/blob/main/.github/workflows/ci.yml',
      supportedFormatsLabel: 'Supported formats:',
      supportedFormats: [
        'GitHub: https://github.com/owner/repo/blob/branch/path/to/file',
        'GitLab: https://gitlab.com/owner/repo/-/blob/branch/path/to/file',
        'Bitbucket: https://bitbucket.org/owner/repo/src/branch/path/to/file'
      ]
    },
    manual: {
      helper: 'Paste your CI/CD pipeline configuration below',
      placeholder: 'Paste your pipeline configuration here (YAML or Groovy)'
    }
  },
  configuration: {
    heading: 'Configuration',
    cicdLabel: 'CI/CD Platform',
    providerLabel: 'LLM Provider',
    apiKeyLabel: 'API Key',
    apiKeyPlaceholder: 'Enter your API key',
    apiKeyHelper: 'Stored in memory by default.',
    apiKeyClear: 'Clear key',
    apiKeyShow: 'Show',
    apiKeyHide: 'Hide'
  },
  results: {
    title: 'Analysis Results',
    validationTitle: 'Validation',
    validationStatusLabel: 'Status',
    validationValid: '✓ Valid',
    validationInvalid: '✗ Invalid',
    validationErrorsTitle: 'Errors:',
    pipelineStructureTitle: 'Pipeline Structure',
    pipelineTypeLabel: 'Type',
    pipelineStagesLabel: 'Stages',
    pipelineJobsLabel: 'Jobs Count',
    pipelineStagesEmpty: 'None found',
    analysisTitle: 'AI Analysis',
    suggestionsTitle: 'Suggestions for Improvement',
    fixesTitle: 'Recommended Fixes',
    comparisonTitle: 'Pipeline Comparison',
    comparisonSubtitle:
      'Review the AI-enhanced pipeline next to your original configuration. Changed lines are highlighted.',
    comparisonChangesNote:
      'Updates in green indicate the AI-generated improvements; the original differences are shown in coral.',
    comparisonNoChangesNote: 'No differences detected — the AI recommended keeping your pipeline as-is.',
    comparisonOriginalTitle: 'Original Pipeline',
    comparisonImprovedTitle: 'AI Improved Pipeline',
    comparisonUnavailable:
      'Pipeline comparison is unavailable because the analysis did not return the original or improved pipeline content.'
  },
  validation: {
    githubActions: {
      missingJobs: 'Missing required "jobs" section',
      missingRunsOn: 'Job "{jobName}" missing required "runs-on" field',
      invalidYaml: 'Invalid YAML: {error}',
      parseFailed: 'Failed to parse: {error}'
    },
    gitlab: {
      missingScript: 'Job "{jobName}" missing required "script" field',
      invalidYaml: 'Invalid YAML: {error}',
      parseFailed: 'Failed to parse: {error}'
    },
    jenkins: {
      missingPipeline: 'Missing required "pipeline" block',
      missingAgent: 'Missing required "agent" directive',
      missingStages: 'Missing required "stages" block',
      parseFailed: 'Failed to parse: {error}'
    }
  },
  prompts: {
    systemLines: [
      'You are a senior DevOps engineer who reviews CI/CD pipelines.',
      'Respond with clear, actionable guidance that prioritizes reliability, security, and performance.',
      'Always return a single JSON object with the following shape:',
      '{ "analysis": string, "suggestions": string[ ], "fixes": string, "improvedPipeline": string }.',
      'Keep suggestions concise and focused on highest-impact improvements.',
      'The improvedPipeline value must contain the full pipeline rewritten with the recommended fixes applied.',
      'If no changes are required, repeat the original pipeline content.',
      'If information is missing, explain what is needed instead of guessing.',
      'Do not include Markdown, code fences, or additional commentary outside the JSON object.'
    ],
    userLines: [
      'CI/CD platform:',
      'Task: Analyze the pipeline configuration. Highlight risks, gaps, and best-practice deviations.',
      'Return prioritized suggestions (at least three when possible) and summarize the most critical fixes.',
      'Produce a complete improvedPipeline string that reflects all recommended fixes applied to the original configuration.',
      'Pipeline configuration:'
    ]
  },
  errors: {
    missingPipeline: 'Please enter pipeline configuration',
    missingRepository: 'Please enter a repository URL',
    missingInput: 'Provide either pipeline content or repository URL to analyze a pipeline.',
    invalidConfig: 'Config must be an object if provided.',
    missingPipelineContent: 'Unable to determine pipeline content to analyze.',
    missingCicdType: 'CI/CD type is required to analyze the pipeline.',
    missingProvider: 'LLM provider is required to perform the analysis.',
    missingApiKey: 'API key is required to call the selected LLM provider.',
    invalidCicdTypeFormat: 'Invalid CI/CD type format.',
    unknownCicdType: 'Unknown CI/CD type.',
    invalidProviderFormat: 'Invalid provider name format.',
    unknownProvider: 'Unknown provider.',
    invalidRepositoryUrl:
      'Invalid repository URL. Supported platforms: GitHub, GitLab, Bitbucket.',
    httpsOnly: 'Only HTTPS URLs are allowed for security reasons.',
    domainNotAllowed: 'Domain not allowed. Only specific domains are supported.',
    invalidUrlFormat: 'Invalid URL format.',
    githubNotFound: 'Pipeline file not found on GitHub.',
    gitlabNotFound: 'Pipeline file not found on GitLab.',
    bitbucketNotFound: 'Pipeline file not found on Bitbucket.',
    githubFetchFailed: 'GitHub pipeline fetch failed.',
    gitlabFetchFailed: 'GitLab pipeline fetch failed.',
    bitbucketFetchFailed: 'Bitbucket pipeline fetch failed.',
    githubFetchUnexpected: 'Unexpected error while fetching from GitHub.',
    gitlabFetchUnexpected: 'Unexpected error while fetching from GitLab.',
    bitbucketFetchUnexpected: 'Unexpected error while fetching from Bitbucket.',
    openaiEmptyResponse: 'OpenAI API returned an empty response.',
    claudeEmptyResponse: 'Claude API returned an empty response.',
    geminiEmptyResponse: 'Gemini API returned an empty response.',
    openaiRequestFailed: 'OpenAI API request failed',
    claudeRequestFailed: 'Anthropic API request failed',
    geminiRequestFailed: 'Gemini API request failed',
    openaiUnexpected: 'Unexpected error while communicating with OpenAI.',
    claudeUnexpected: 'Unexpected error while communicating with Anthropic.',
    geminiUnexpected: 'Unexpected error while communicating with Gemini.',
    llmEmptyResponse: 'The LLM returned an empty response.',
    llmNoFixes: 'No fixes provided.',
    llmFallbackFixes: 'Refer to the analysis for remediation guidance.',
    unexpectedError: 'An unexpected error occurred.'
  }
} as const;
