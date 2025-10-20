import axios from 'axios';

export interface RepositoryInfo {
  platform: string;
  owner: string;
  repo: string;
  branch?: string;
  filePath: string;
}

export class RepositoryFetcher {
  /**
   * Parse a repository URL to extract platform, owner, repo, and file path
   */
  static parseRepositoryUrl(url: string): RepositoryInfo | null {
    // GitHub: https://github.com/owner/repo/blob/branch/path/to/file
    const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
    if (githubMatch) {
      return {
        platform: 'github',
        owner: githubMatch[1],
        repo: githubMatch[2],
        branch: githubMatch[3],
        filePath: githubMatch[4]
      };
    }

    // GitLab: https://gitlab.com/owner/repo/-/blob/branch/path/to/file
    const gitlabMatch = url.match(/gitlab\.com\/([^\/]+)\/([^\/]+)\/-\/blob\/([^\/]+)\/(.+)/);
    if (gitlabMatch) {
      return {
        platform: 'gitlab',
        owner: gitlabMatch[1],
        repo: gitlabMatch[2],
        branch: gitlabMatch[3],
        filePath: gitlabMatch[4]
      };
    }

    // Bitbucket: https://bitbucket.org/owner/repo/src/branch/path/to/file
    const bitbucketMatch = url.match(/bitbucket\.org\/([^\/]+)\/([^\/]+)\/src\/([^\/]+)\/(.+)/);
    if (bitbucketMatch) {
      return {
        platform: 'bitbucket',
        owner: bitbucketMatch[1],
        repo: bitbucketMatch[2],
        branch: bitbucketMatch[3],
        filePath: bitbucketMatch[4]
      };
    }

    return null;
  }

  /**
   * Detect CI/CD type from file path
   */
  static detectCICDType(filePath: string): string | null {
    const normalizedPath = filePath.toLowerCase();
    
    if (normalizedPath.includes('.github/workflows/') || normalizedPath.endsWith('.yml') || normalizedPath.endsWith('.yaml')) {
      return 'github-actions';
    }
    
    if (normalizedPath === '.gitlab-ci.yml' || normalizedPath === 'gitlab-ci.yml') {
      return 'gitlab-ci';
    }
    
    if (normalizedPath === 'jenkinsfile' || normalizedPath.endsWith('jenkinsfile')) {
      return 'jenkins';
    }
    
    // Default based on file extension
    if (normalizedPath.endsWith('.yml') || normalizedPath.endsWith('.yaml')) {
      return 'github-actions'; // Default assumption
    }
    
    return null;
  }

  /**
   * Validate that the URL is safe and from a trusted platform
   */
  private static validateUrl(url: string): void {
    // Only allow HTTPS URLs
    if (!url.startsWith('https://')) {
      throw new Error('Only HTTPS URLs are allowed for security reasons');
    }

    // Whitelist of allowed domains
    const allowedDomains = [
      'github.com',
      'raw.githubusercontent.com',
      'gitlab.com',
      'bitbucket.org'
    ];

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      if (!allowedDomains.includes(domain)) {
        throw new Error(`Domain not allowed. Only ${allowedDomains.join(', ')} are supported`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Domain not allowed')) {
        throw error;
      }
      throw new Error('Invalid URL format');
    }
  }

  /**
   * Fetch file content from GitHub
   */
  private static async fetchFromGitHub(info: RepositoryInfo): Promise<string> {
    const branch = info.branch || 'main';
    const rawUrl = `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${branch}/${info.filePath}`;
    
    // Validate URL before making request
    this.validateUrl(rawUrl);
    
    try {
      const response = await axios.get(rawUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw'
        },
        timeout: 10000, // 10 second timeout
        maxRedirects: 0 // Don't follow redirects for security
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`File not found: ${info.filePath} in ${info.owner}/${info.repo}`);
      }
      throw error;
    }
  }

  /**
   * Fetch file content from GitLab
   */
  private static async fetchFromGitLab(info: RepositoryInfo): Promise<string> {
    const branch = info.branch || 'main';
    const encodedPath = encodeURIComponent(info.filePath);
    const encodedProject = encodeURIComponent(`${info.owner}/${info.repo}`);
    const apiUrl = `https://gitlab.com/api/v4/projects/${encodedProject}/repository/files/${encodedPath}/raw?ref=${branch}`;
    
    // Validate URL before making request
    this.validateUrl(apiUrl);
    
    try {
      const response = await axios.get(apiUrl, {
        timeout: 10000, // 10 second timeout
        maxRedirects: 0 // Don't follow redirects for security
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`File not found: ${info.filePath} in ${info.owner}/${info.repo}`);
      }
      throw error;
    }
  }

  /**
   * Fetch file content from Bitbucket
   */
  private static async fetchFromBitbucket(info: RepositoryInfo): Promise<string> {
    const branch = info.branch || 'main';
    const rawUrl = `https://bitbucket.org/${info.owner}/${info.repo}/raw/${branch}/${info.filePath}`;
    
    // Validate URL before making request
    this.validateUrl(rawUrl);
    
    try {
      const response = await axios.get(rawUrl, {
        timeout: 10000, // 10 second timeout
        maxRedirects: 0 // Don't follow redirects for security
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`File not found: ${info.filePath} in ${info.owner}/${info.repo}`);
      }
      throw error;
    }
  }

  /**
   * Fetch pipeline configuration from a repository URL
   */
  static async fetchPipeline(url: string): Promise<{ content: string; detectedCICDType: string | null }> {
    const repoInfo = this.parseRepositoryUrl(url);
    
    if (!repoInfo) {
      throw new Error('Invalid repository URL. Supported platforms: GitHub, GitLab, Bitbucket');
    }

    let content: string;
    
    switch (repoInfo.platform) {
      case 'github':
        content = await this.fetchFromGitHub(repoInfo);
        break;
      case 'gitlab':
        content = await this.fetchFromGitLab(repoInfo);
        break;
      case 'bitbucket':
        content = await this.fetchFromBitbucket(repoInfo);
        break;
      default:
        throw new Error(`Unsupported platform: ${repoInfo.platform}`);
    }

    const detectedCICDType = this.detectCICDType(repoInfo.filePath);
    
    return {
      content,
      detectedCICDType
    };
  }
}
