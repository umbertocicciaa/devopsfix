# DevOpsFix Quick Start Guide

Get up and running with DevOpsFix in minutes!

## Prerequisites

- Node.js 16 or higher
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/umbertocicciaa/devopsfix.git
   cd devopsfix
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **(Optional) Install backend dependencies** if you plan to run the API server:
   ```bash
   cd ../backend
   npm install
   ```

## Running the Application

### Option 1: Development Mode (Recommended for testing)

1. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will open automatically at http://localhost:3000

2. **(Optional) Start the backend server** if you want the API server for extension work:
   ```bash
   cd backend
   npm run dev
   ```

### Option 2: Production Mode

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   Then serve the `build` folder with a static server.

2. **(Optional) Build and start the backend** if you need the API server:
   ```bash
   cd backend
   npm run build
   npm start
   ```

## Using DevOpsFix

### Step 1: Open the Application
Navigate to http://localhost:3000 in your browser.

### Step 2: Choose Input Method

**Option A: From Repository (Recommended)**
1. Keep the **"📁 From Repository"** button selected (default)
2. Enter a direct URL to your pipeline file:
   - GitHub: `https://github.com/owner/repo/blob/main/.github/workflows/ci.yml`
   - GitLab: `https://gitlab.com/owner/repo/-/blob/main/.gitlab-ci.yml`
   - Bitbucket: `https://bitbucket.org/owner/repo/src/main/Jenkinsfile`

**Example URLs:**
```
https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml
https://github.com/actions/starter-workflows/blob/main/ci/python-app.yml
```

**Option B: Manual Paste**
1. Click the **"✏️ Manual Paste"** button
2. Copy your CI/CD pipeline configuration and paste it into the text area

**Example GitHub Actions pipeline:**
```yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
```

**Example GitLab CI pipeline:**
```yaml
stages:
  - build
  - test

build-job:
  stage: build
  script:
    - npm install
    - npm run build
```

**Example Jenkins pipeline:**
```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
    }
}
```

### Step 3: Select LLM Provider
Choose your preferred AI provider:
- **ChatGPT** (OpenAI)
- **Claude** (Anthropic)
- **Gemini** (Google)

Enter the provider API key in the configuration panel. Keys are stored locally in your browser storage for static deployments.

**Note:** When using Repository mode, the CI/CD platform is auto-detected from the file path. For Manual Paste mode, select the platform manually.

### Step 4: Analyze
Click the "Analyze Pipeline" button and wait a few seconds for the results.

### Step 5: Review Results
The analysis will show:
- ✅ **Validation Status**: Whether your pipeline is valid
- 📊 **Pipeline Structure**: Detected stages and jobs
- 🤖 **AI Analysis**: Overall assessment from the LLM
- 💡 **Suggestions**: Specific improvements you can make
- 🔧 **Recommended Fixes**: Actionable fixes for your pipeline

## Example Use Cases

### 1. Analyzing Public Repositories
Quickly analyze any public GitHub, GitLab, or Bitbucket pipeline:
```
https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml
```
- No need to clone the repository
- Instantly get AI-powered insights
- Learn from real-world examples

### 2. Validating a New Pipeline
Before committing a new CI/CD configuration, paste it into DevOpsFix to:
- Check for syntax errors
- Validate required fields
- Get suggestions for improvements

### 3. Optimizing Existing Pipelines
For pipelines that work but could be better:
- Get recommendations for caching
- Learn about parallel execution opportunities
- Discover security best practices

### 4. Learning CI/CD Best Practices
Use DevOpsFix as a learning tool:
- Experiment with different configurations
- See what the AI recommends
- Understand why certain patterns are better

## Troubleshooting

### Backend won't start
- Check that port 3001 is not in use
- Verify Node.js version is 16 or higher
- Try deleting `node_modules` and running `npm install` again

### Frontend won't start
- Check that port 3000 is not in use
- Verify backend is running
- Check the console for error messages

### Analysis fails
- Ensure your pipeline syntax is valid YAML or Groovy
- Check that you selected the correct CI/CD platform
- Verify your LLM API key is present in the configuration panel

## Next Steps

- Read the full [README.md](README.md) for detailed information
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to add new providers or parsers
- Explore the example pipelines in the `examples/` directory

## Need Help?

Open an issue on GitHub if you encounter problems or have questions!
