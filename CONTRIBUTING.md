# Contributing to DevOpsFix

Thank you for your interest in contributing to DevOpsFix! This guide will help you add new CI/CD parsers and LLM providers to the framework.

## Adding a New LLM Provider

Follow these steps to add support for a new Large Language Model provider:

### 1. Create the Provider Class

Create a new file in `backend/src/providers/` (e.g., `NewLLMProvider.ts`):

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
    // Use this.config to access API keys and other configuration
    
    // Example structure:
    const apiKey = this.config.apiKey || process.env.NEW_LLM_API_KEY;
    
    // Make API call to your LLM service
    // ...
    
    return {
      suggestions: ['Suggestion 1', 'Suggestion 2'],
      analysis: 'Overall analysis of the pipeline',
      fixes: 'Recommended fixes'
    };
  }
}
```

### 2. Register the Provider

Update `backend/src/utils/ProviderFactory.ts`:

```typescript
import { NewLLMProvider } from '../providers/NewLLMProvider';

// Add to the providers Map in the ProviderFactory class
private static providers: Map<string, new (config: LLMProviderConfig) => LLMProvider> = new Map([
  ['chatgpt', ChatGPTProvider],
  ['claude', ClaudeProvider],
  ['gemini', GeminiProvider],
  ['newllm', NewLLMProvider]  // Add your new provider here
]);
```

### 3. Update Environment Variables (Optional)

If your provider needs an API key, add it to `backend/.env.example`:

```env
NEW_LLM_API_KEY=your_api_key_here
```

### 4. Test Your Provider

Test your provider using curl:

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pipelineContent": "your pipeline config here",
    "cicdType": "github-actions",
    "llmProvider": "newllm",
    "config": {
      "apiKey": "your_api_key"
    }
  }'
```

## Adding a New CI/CD Parser

Follow these steps to add support for a new CI/CD platform:

### 1. Create the Parser Class

Create a new file in `backend/src/parsers/` (e.g., `CircleCIParser.ts`):

```typescript
import { CICDParser, ParsedPipeline } from '../interfaces/CICDParser';

export class CircleCIParser extends CICDParser {
  getName(): string {
    return 'CircleCI';
  }

  parse(content: string): ParsedPipeline {
    try {
      // Implement parsing logic for your CI/CD platform
      // Parse YAML, JSON, or other configuration format
      
      return {
        type: 'CircleCI',
        stages: ['build', 'test', 'deploy'],  // Extract stages
        jobs: [],  // Extract jobs with their details
        issues: this.validate(content).errors
      };
    } catch (error) {
      return {
        type: 'CircleCI',
        stages: [],
        jobs: [],
        issues: [`Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  validate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Implement validation logic
      // Check for required fields, syntax errors, etc.
      
      // Example validation:
      if (!content.includes('version')) {
        errors.push('Missing required "version" field');
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}
```

### 2. Register the Parser

Update `backend/src/utils/ParserFactory.ts`:

```typescript
import { CircleCIParser } from '../parsers/CircleCIParser';

// Add to the parsers Map in the ParserFactory class
private static parsers: Map<string, new () => CICDParser> = new Map([
  ['github-actions', GitHubActionsParser],
  ['gitlab-ci', GitLabCIParser],
  ['jenkins', JenkinsParser],
  ['circleci', CircleCIParser]  // Add your new parser here
]);
```

### 3. Test Your Parser

Test your parser using curl:

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pipelineContent": "your circleci config here",
    "cicdType": "circleci",
    "llmProvider": "chatgpt"
  }'
```

## Development Workflow

1. **Clone the repository**
   ```bash
   git clone https://github.com/umbertocicciaa/devopsfix.git
   cd devopsfix
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Start development servers**
   ```bash
   # Backend (in one terminal)
   cd backend
   npm run dev
   
   # Frontend (in another terminal)
   cd frontend
   npm start
   ```

4. **Make your changes**
   - Follow the TypeScript style guide
   - Add appropriate error handling
   - Keep the code clean and maintainable

5. **Test your changes**
   - Test through the UI at http://localhost:3000
   - Test the API directly using curl
   - Ensure existing functionality still works

6. **Build for production**
   ```bash
   # Backend
   cd backend
   npm run build
   
   # Frontend
   cd frontend
   npm run build
   ```

## Code Style Guidelines

- Use TypeScript for type safety
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Handle errors gracefully
- Validate all user inputs

## Common Dependencies

### For YAML Parsing
Already installed: `js-yaml`

### For JSON Parsing
Built-in: `JSON.parse()`

### For HTTP Requests (if needed)
Consider: `axios` or native `fetch`

## Testing

Currently, the framework uses manual testing through the UI and curl commands. Future contributions could include:
- Unit tests for parsers
- Integration tests for providers
- End-to-end tests for the full workflow

## Questions?

If you have questions or need help, please:
1. Check the README.md for general information
2. Review existing implementations as examples
3. Open an issue on GitHub

## License

By contributing to DevOpsFix, you agree that your contributions will be licensed under the ISC License.
