export const INPUT_MODES = {
  repository: 'repository',
  manual: 'manual'
} as const;

export type InputMode = (typeof INPUT_MODES)[keyof typeof INPUT_MODES];

export const LLM_PROVIDER_IDS = {
  chatgpt: 'chatgpt',
  claude: 'claude',
  gemini: 'gemini'
} as const;

export type LLMProviderId = (typeof LLM_PROVIDER_IDS)[keyof typeof LLM_PROVIDER_IDS];

export const CICD_TYPE_IDS = {
  githubActions: 'github-actions',
  gitlabCi: 'gitlab-ci',
  jenkins: 'jenkins'
} as const;

export type CICDTypeId = (typeof CICD_TYPE_IDS)[keyof typeof CICD_TYPE_IDS];

export const REPOSITORY_PLATFORMS = {
  github: 'github',
  gitlab: 'gitlab',
  bitbucket: 'bitbucket'
} as const;

export type RepositoryPlatform = (typeof REPOSITORY_PLATFORMS)[keyof typeof REPOSITORY_PLATFORMS];

export const STORAGE_KEYS = {
  apiKeyPrefix: 'devopsfix.llmApiKey'
} as const;

export const ERROR_CODES = {
  internal: 'internal_error',
  badRequest: 'bad_request',
  validation: 'validation_error',
  notFound: 'not_found',
  configuration: 'configuration_error',
  externalService: 'external_service_error'
} as const;

export const ANALYSIS_FIELDS = {
  pipelineContent: 'pipelineContent',
  repositoryUrl: 'repositoryUrl'
} as const;

export const LLM_DEFAULTS = {
  temperature: 0.2,
  maxTokens: 900,
  requestTimeoutMs: 30000
} as const;

export const LLM_ENDPOINTS = {
  openaiChat: 'https://api.openai.com/v1/chat/completions',
  anthropicMessages: 'https://api.anthropic.com/v1/messages',
  geminiModels: 'https://generativelanguage.googleapis.com/v1beta/models'
} as const;

export const LLM_PROVIDERS = [
  {
    id: LLM_PROVIDER_IDS.chatgpt,
    label: 'ChatGPT',
    apiKeyLabel: 'OpenAI API Key',
    defaultModel: 'gpt-4o-mini'
  },
  {
    id: LLM_PROVIDER_IDS.claude,
    label: 'Claude',
    apiKeyLabel: 'Anthropic API Key',
    defaultModel: 'claude-3-sonnet-20240229'
  },
  {
    id: LLM_PROVIDER_IDS.gemini,
    label: 'Gemini',
    apiKeyLabel: 'Google Gemini API Key',
    defaultModel: 'gemini-1.5-flash'
  }
] as const;

export const CICD_TYPES = [
  {
    id: CICD_TYPE_IDS.githubActions,
    label: 'GitHub Actions',
    filePathHints: ['.github/workflows/'],
    fileNameHints: [],
    defaultExtensions: ['.yml', '.yaml']
  },
  {
    id: CICD_TYPE_IDS.gitlabCi,
    label: 'GitLab CI',
    filePathHints: [],
    fileNameHints: ['.gitlab-ci.yml', 'gitlab-ci.yml'],
    defaultExtensions: []
  },
  {
    id: CICD_TYPE_IDS.jenkins,
    label: 'Jenkins',
    filePathHints: [],
    fileNameHints: ['jenkinsfile'],
    defaultExtensions: []
  }
] as const;

export const REPOSITORY_CONFIG = {
  allowedDomains: ['github.com', 'raw.githubusercontent.com', 'gitlab.com', 'bitbucket.org'],
  defaultBranch: 'main',
  requestTimeoutMs: 10000,
  maxRedirects: 0,
  githubRawBaseUrl: 'https://raw.githubusercontent.com',
  gitlabApiBaseUrl: 'https://gitlab.com/api/v4',
  bitbucketRawBaseUrl: 'https://bitbucket.org'
} as const;

export const HTTP_HEADERS = {
  authorization: 'Authorization: Bearer',
  contentType: 'Content-Type',
  accept: 'Accept',
  apiKey: 'x-api-key',
  anthropicVersion: 'anthropic-version'
} as const;

export const HTTP_HEADER_VALUES = {
  json: 'application/json',
  githubRaw: 'application/vnd.github.v3.raw'
} as const;

export const API_VERSIONS = {
  anthropic: '2023-06-01'
} as const;
