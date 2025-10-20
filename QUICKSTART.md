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

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Option 1: Development Mode (Recommended for testing)

1. **Start the backend server** (in terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on http://localhost:3001

2. **Start the frontend** (in terminal 2):
   ```bash
   cd frontend
   npm start
   ```
   The frontend will open automatically at http://localhost:3000

### Option 2: Production Mode

1. **Build and start the backend**:
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   Then serve the `build` folder with a static server.

## Using DevOpsFix

### Step 1: Open the Application
Navigate to http://localhost:3000 in your browser.

### Step 2: Select Your Configuration
- **CI/CD Platform**: Choose from GitHub Actions, GitLab CI, or Jenkins
- **LLM Provider**: Select ChatGPT, Claude, or Gemini

### Step 3: Paste Your Pipeline
Copy your CI/CD pipeline configuration and paste it into the text area.

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

### 1. Validating a New Pipeline
Before committing a new CI/CD configuration, paste it into DevOpsFix to:
- Check for syntax errors
- Validate required fields
- Get suggestions for improvements

### 2. Optimizing Existing Pipelines
For pipelines that work but could be better:
- Get recommendations for caching
- Learn about parallel execution opportunities
- Discover security best practices

### 3. Learning CI/CD Best Practices
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
- Verify the backend server is running

## Next Steps

- Read the full [README.md](README.md) for detailed information
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to add new providers or parsers
- Explore the example pipelines in the `examples/` directory

## Need Help?

Open an issue on GitHub if you encounter problems or have questions!
