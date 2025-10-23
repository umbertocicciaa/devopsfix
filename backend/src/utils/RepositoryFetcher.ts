import axios from 'axios';
import { BadRequestError, ExternalServiceError, NotFoundError } from './AppError';

export interface RepositoryInfo {
  platform: string;
  owner: string;
  repo: string;
  branch?: string;
  filePath: string;
}

export class RepositoryFetcher {
  /**
   * Normalize incoming URLs by trimming whitespace and removing query/hash fragments.
   */
  private static sanitizeInputUrl(url: string): string {
    const trimmed = url.trim();
    const hashIndex = trimmed.indexOf('#');
    const withoutHash = hashIndex !== -1 ? trimmed.slice(0, hashIndex) : trimmed;
    const queryIndex = withoutHash.indexOf('?');
    return queryIndex !== -1 ? withoutHash.slice(0, queryIndex) : withoutHash;
  }

  /**
   * Decode a slash-separated path into human-readable form.
   */
  private static decodePath(path: string): string {
    return path
      .split('/')
      .map(segment => decodeURIComponent(segment))
      .join('/');
  }

  /**
   * Encode each segment of a slash-separated path to produce a safe URL path.
   */
  private static encodePath(path: string): string {
    return path
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');
  }

  private static encodeGitRef(ref: string): string {
    return this.encodePath(ref);
  }

  /**
   * Parse a repository URL to extract platform, owner, repo, and file path
   */
  static parseRepositoryUrl(url: string): RepositoryInfo | null {
    const sanitizedUrl = this.sanitizeInputUrl(url);

    // GitHub: https://github.com/owner/repo/blob/branch/path/to/file
    const githubMatch = sanitizedUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
    if (githubMatch) {
      return {
        platform: 'github',
        owner: decodeURIComponent(githubMatch[1]),
        repo: decodeURIComponent(githubMatch[2]),
        branch: this.decodePath(githubMatch[3]),
        filePath: this.decodePath(githubMatch[4])
      };
    }

    // GitLab: https://gitlab.com/owner/repo/-/blob/branch/path/to/file
    const gitlabMatch = sanitizedUrl.match(/gitlab\.com\/([^\/]+)\/([^\/]+)\/-\/blob\/([^\/]+)\/(.+)/);
    if (gitlabMatch) {
      return {
        platform: 'gitlab',
        owner: decodeURIComponent(gitlabMatch[1]),
        repo: decodeURIComponent(gitlabMatch[2]),
        branch: this.decodePath(gitlabMatch[3]),
        filePath: this.decodePath(gitlabMatch[4])
      };
    }

    // Bitbucket: https://bitbucket.org/owner/repo/src/branch/path/to/file
    const bitbucketMatch = sanitizedUrl.match(/bitbucket\.org\/([^\/]+)\/([^\/]+)\/src\/([^\/]+)\/(.+)/);
    if (bitbucketMatch) {
      return {
        platform: 'bitbucket',
        owner: decodeURIComponent(bitbucketMatch[1]),
        repo: decodeURIComponent(bitbucketMatch[2]),
        branch: this.decodePath(bitbucketMatch[3]),
        filePath: this.decodePath(bitbucketMatch[4])
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
      throw new BadRequestError('Only HTTPS URLs are allowed for security reasons.', { url });
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
        throw new BadRequestError('Domain not allowed. Only specific domains are supported.', {
          url,
          domain,
          allowedDomains
        });
      }
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Invalid URL format.', { url });
    }
  }

  /**
   * Fetch file content from GitHub
   */
  private static async fetchFromGitHub(info: RepositoryInfo): Promise<string> {
    const branch = info.branch || 'main';
    const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}/${this.encodeGitRef(branch)}/${this.encodePath(info.filePath)}`;
    
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
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NotFoundError('Pipeline file not found on GitHub.', {
            owner: info.owner,
            repo: info.repo,
            path: info.filePath,
            branch
          });
        }

        throw new ExternalServiceError('GitHub pipeline fetch failed.', {
          status: error.response?.status,
          owner: info.owner,
          repo: info.repo,
          path: info.filePath,
          branch,
          message: error.message
        });
      }

      throw new ExternalServiceError('Unexpected error while fetching from GitHub.', {
        owner: info.owner,
        repo: info.repo,
        path: info.filePath,
        branch
      });
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
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NotFoundError('Pipeline file not found on GitLab.', {
            owner: info.owner,
            repo: info.repo,
            path: info.filePath,
            branch
          });
        }

        throw new ExternalServiceError('GitLab pipeline fetch failed.', {
          status: error.response?.status,
          owner: info.owner,
          repo: info.repo,
          path: info.filePath,
          branch,
          message: error.message
        });
      }

      throw new ExternalServiceError('Unexpected error while fetching from GitLab.', {
        owner: info.owner,
        repo: info.repo,
        path: info.filePath,
        branch
      });
    }
  }

  /**
   * Fetch file content from Bitbucket
   */
  private static async fetchFromBitbucket(info: RepositoryInfo): Promise<string> {
    const branch = info.branch || 'main';
    const rawUrl = `https://bitbucket.org/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}/raw/${this.encodeGitRef(branch)}/${this.encodePath(info.filePath)}`;
    
    // Validate URL before making request
    this.validateUrl(rawUrl);
    
    try {
      const response = await axios.get(rawUrl, {
        timeout: 10000, // 10 second timeout
        maxRedirects: 0 // Don't follow redirects for security
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NotFoundError('Pipeline file not found on Bitbucket.', {
            owner: info.owner,
            repo: info.repo,
            path: info.filePath,
            branch
          });
        }

        throw new ExternalServiceError('Bitbucket pipeline fetch failed.', {
          status: error.response?.status,
          owner: info.owner,
          repo: info.repo,
          path: info.filePath,
          branch,
          message: error.message
        });
      }

      throw new ExternalServiceError('Unexpected error while fetching from Bitbucket.', {
        owner: info.owner,
        repo: info.repo,
        path: info.filePath,
        branch
      });
    }
  }

  /**
   * Fetch pipeline configuration from a repository URL
   */
  static async fetchPipeline(url: string): Promise<{ content: string; detectedCICDType: string | null }> {
    const repoInfo = this.parseRepositoryUrl(url);
    
    if (!repoInfo) {
      throw new BadRequestError('Invalid repository URL. Supported platforms: GitHub, GitLab, Bitbucket.', { url });
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
        throw new BadRequestError('Unsupported source control platform.', {
          platform: repoInfo.platform
        });
    }

    const detectedCICDType = this.detectCICDType(repoInfo.filePath);
    
    return {
      content,
      detectedCICDType
    };
  }
}
