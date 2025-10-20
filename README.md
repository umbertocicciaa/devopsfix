# DevOpsFix - CI/CD Pipeline Analyzer

DevOpsFix is a modern fullstack application that leverages Large Language Models (LLMs) to analyze, fix, and improve CI/CD pipelines. Built with extensibility in mind, it supports multiple CI/CD platforms and LLM providers, with the ability to easily add more as they emerge.

## Features

- **Multi-Platform Support**: Analyze pipelines from GitHub Actions, GitLab CI, and Jenkins
- **Multiple LLM Providers**: Choose from ChatGPT, Claude, or Gemini for AI-powered analysis
- **Extensible Architecture**: Plugin-based system allows easy addition of new CI/CD tools and LLM providers
- **Real-time Analysis**: Get instant feedback on your pipeline configuration
- **Validation & Suggestions**: Automatic validation with AI-generated improvement suggestions

## Architecture

### Backend (Node.js + TypeScript + Express)
- **Plugin Architecture**: Abstract interfaces for LLM providers and CI/CD parsers
- **Provider Factory**: Manages LLM provider instances
- **Parser Factory**: Manages CI/CD pipeline parsers
- **RESTful API**: Clean API endpoints for analysis and configuration

### Frontend (React + TypeScript)
- **Modern UI**: Clean, responsive interface built with React
- **Real-time Feedback**: Instant validation and analysis results
- **Configuration Panel**: Easy selection of CI/CD platform and LLM provider

## Project Structure

```
devopsfix/
├── backend/                  # Backend API server
│   ├── src/
│   │   ├── interfaces/      # Abstract interfaces for extensibility
│   │   │   ├── LLMProvider.ts
│   │   │   └── CICDParser.ts
│   │   ├── providers/       # LLM provider implementations
│   │   │   ├── ChatGPTProvider.ts
│   │   │   ├── ClaudeProvider.ts
│   │   │   └── GeminiProvider.ts
│   │   ├── parsers/         # CI/CD parser implementations
│   │   │   ├── GitHubActionsParser.ts
│   │   │   ├── GitLabCIParser.ts
│   │   │   └── JenkinsParser.ts
│   │   ├── utils/           # Factory classes
│   │   │   ├── ProviderFactory.ts
│   │   │   └── ParserFactory.ts
│   │   ├── routes/          # API routes
│   │   │   └── analyze.ts
│   │   └── server.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── PipelineInput.tsx
│   │   │   ├── ConfigurationPanel.tsx
│   │   │   └── ResultsDisplay.tsx
│   │   ├── services/        # API service layer
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- TypeScript knowledge (optional, for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/umbertocicciaa/devopsfix.git
cd devopsfix
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

#### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:3001

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```
The frontend will run on http://localhost:3000

#### Production Mode

1. Build the backend:
```bash
cd backend
npm run build
npm start
```

2. Build the frontend:
```bash
cd frontend
npm run build
```
Serve the `build` folder with a static server.

## Usage

1. Open the application in your browser (http://localhost:3000 in development)
2. Select your CI/CD platform (GitHub Actions, GitLab CI, or Jenkins)
3. Choose your preferred LLM provider (ChatGPT, Claude, or Gemini)
4. Paste your pipeline configuration in the text area
5. Click "Analyze Pipeline" to get AI-powered analysis and suggestions

## Example Pipeline Configurations

### GitHub Actions Example
```yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
```

### GitLab CI Example
```yaml
stages:
  - build
  - test

build-job:
  stage: build
  script:
    - npm install
    - npm run build

test-job:
  stage: test
  script:
    - npm test
```

### Jenkins Example
```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
}
```

## Extensibility

### Adding a New LLM Provider

1. Create a new provider class in `backend/src/providers/`:

```typescript
import { LLMProvider, LLMProviderConfig, LLMResponse } from '../interfaces/LLMProvider';

export class NewLLMProvider extends LLMProvider {
  constructor(config: LLMProviderConfig) {
    super(config);
  }

  getName(): string {
    return 'NewLLM';
  }

  async analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMResponse> {
    // Implement your LLM API call here
    return {
      suggestions: [],
      analysis: '',
      fixes: ''
    };
  }
}
```

2. Register it in `backend/src/utils/ProviderFactory.ts`:

```typescript
import { NewLLMProvider } from '../providers/NewLLMProvider';

// Add to the providers Map
['newllm', NewLLMProvider]
```

### Adding a New CI/CD Parser

1. Create a new parser class in `backend/src/parsers/`:

```typescript
import { CICDParser, ParsedPipeline } from '../interfaces/CICDParser';

export class NewCICDParser extends CICDParser {
  getName(): string {
    return 'New CI/CD Tool';
  }

  parse(content: string): ParsedPipeline {
    // Implement parsing logic
    return {
      type: 'New CI/CD Tool',
      stages: [],
      jobs: [],
      issues: []
    };
  }

  validate(content: string): { valid: boolean; errors: string[] } {
    // Implement validation logic
    return { valid: true, errors: [] };
  }
}
```

2. Register it in `backend/src/utils/ParserFactory.ts`:

```typescript
import { NewCICDParser } from '../parsers/NewCICDParser';

// Add to the parsers Map
['new-cicd', NewCICDParser]
```

## API Endpoints

### POST /api/analyze
Analyze a CI/CD pipeline configuration.

**Request Body:**
```json
{
  "pipelineContent": "string",
  "cicdType": "github-actions|gitlab-ci|jenkins",
  "llmProvider": "chatgpt|claude|gemini",
  "config": {
    "apiKey": "optional",
    "model": "optional",
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

**Response:**
```json
{
  "success": true,
  "parsed": {
    "type": "string",
    "stages": ["stage1", "stage2"],
    "jobs": [],
    "issues": []
  },
  "validation": {
    "valid": true,
    "errors": []
  },
  "analysis": {
    "suggestions": [],
    "analysis": "string",
    "fixes": "string"
  },
  "provider": "string"
}
```

### GET /api/providers
Get list of available LLM providers.

**Response:**
```json
{
  "providers": ["chatgpt", "claude", "gemini"]
}
```

### GET /api/cicd-types
Get list of supported CI/CD platforms.

**Response:**
```json
{
  "cicdTypes": ["github-actions", "gitlab-ci", "jenkins"]
}
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001

# Optional: LLM API Keys for production use
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Technology Stack

- **Backend**: Node.js, TypeScript, Express, js-yaml
- **Frontend**: React, TypeScript, Axios
- **Architecture**: Plugin-based, Factory Pattern
- **API**: RESTful

## Future Enhancements

- Add more CI/CD platforms (CircleCI, Azure Pipelines, etc.)
- Integrate actual LLM APIs (OpenAI, Anthropic, Google)
- Add authentication and user management
- Implement pipeline history and comparison
- Add export functionality for analysis reports
- Real-time collaboration features
- Advanced caching and optimization

## Contributing

Contributions are welcome! The plugin architecture makes it easy to add new providers and parsers.

## License

ISC

## Author

Umberto Ciccia