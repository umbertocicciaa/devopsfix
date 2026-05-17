import axios from 'axios';
import { APP_COPY } from '../../config/appCopy';
import {
  CICD_TYPES,
  CICD_TYPE_IDS,
  HTTP_HEADER_VALUES,
  HTTP_HEADERS,
  REPOSITORY_CONFIG,
  REPOSITORY_PLATFORMS
} from '../../config/appConfig';
import { BadRequestError, ExternalServiceError, NotFoundError } from '../../services/errors';

export interface RepositoryInfo {
  platform: string;
  owner: string;
  repo: string;
  branch?: string;
  filePath: string;
}

export class RepositoryFetcher {
  private static sanitizeInputUrl(url: string): string {
    const trimmed = url.trim();
    const hashIndex = trimmed.indexOf('#');
    const withoutHash = hashIndex !== -1 ? trimmed.slice(0, hashIndex) : trimmed;
    const queryIndex = withoutHash.indexOf('?');
    return queryIndex !== -1 ? withoutHash.slice(0, queryIndex) : withoutHash;
  }

  private static decodePath(path: string): string {
    return path
      .split('/')
      .map((segment) => decodeURIComponent(segment))
      .join('/');
  }

  private static encodePath(path: string): string {
    return path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
  }

  private static encodeGitRef(ref: string): string {
    return this.encodePath(ref);
  }

  static parseRepositoryUrl(url: string): RepositoryInfo | null {
    const sanitizedUrl = this.sanitizeInputUrl(url);

    const githubMatch = sanitizedUrl.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
    if (githubMatch) {
      return {
        platform: REPOSITORY_PLATFORMS.github,
        owner: decodeURIComponent(githubMatch[1]),
        repo: decodeURIComponent(githubMatch[2]),
        branch: this.decodePath(githubMatch[3]),
        filePath: this.decodePath(githubMatch[4])
      };
    }

    const gitlabMatch = sanitizedUrl.match(/gitlab\.com\/([^/]+)\/([^/]+)\/-\/blob\/([^/]+)\/(.+)/);
    if (gitlabMatch) {
      return {
        platform: REPOSITORY_PLATFORMS.gitlab,
        owner: decodeURIComponent(gitlabMatch[1]),
        repo: decodeURIComponent(gitlabMatch[2]),
        branch: this.decodePath(gitlabMatch[3]),
        filePath: this.decodePath(gitlabMatch[4])
      };
    }

    const bitbucketMatch = sanitizedUrl.match(/bitbucket\.org\/([^/]+)\/([^/]+)\/src\/([^/]+)\/(.+)/);
    if (bitbucketMatch) {
      return {
        platform: REPOSITORY_PLATFORMS.bitbucket,
        owner: decodeURIComponent(bitbucketMatch[1]),
        repo: decodeURIComponent(bitbucketMatch[2]),
        branch: this.decodePath(bitbucketMatch[3]),
        filePath: this.decodePath(bitbucketMatch[4])
      };
    }

    return null;
  }

  static detectCICDType(filePath: string): string | null {
    const normalizedPath = filePath.toLowerCase();
    const githubActions = CICD_TYPES.find((type) => type.id === CICD_TYPE_IDS.githubActions);
    const gitlab = CICD_TYPES.find((type) => type.id === CICD_TYPE_IDS.gitlabCi);
    const jenkins = CICD_TYPES.find((type) => type.id === CICD_TYPE_IDS.jenkins);

    if (githubActions?.filePathHints.some((hint) => normalizedPath.includes(hint))) {
      return CICD_TYPE_IDS.githubActions;
    }

    if (gitlab?.fileNameHints.some((hint) => normalizedPath === hint)) {
      return CICD_TYPE_IDS.gitlabCi;
    }

    if (jenkins?.fileNameHints.some((hint) => normalizedPath.endsWith(hint))) {
      return CICD_TYPE_IDS.jenkins;
    }

    if (githubActions?.defaultExtensions.some((extension) => normalizedPath.endsWith(extension))) {
      return CICD_TYPE_IDS.githubActions;
    }

    return null;
  }

  private static validateUrl(url: string): void {
    if (!url.startsWith('https://')) {
      throw new BadRequestError(APP_COPY.errors.httpsOnly, { url });
    }

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      if (
        !REPOSITORY_CONFIG.allowedDomains.includes(
          domain as (typeof REPOSITORY_CONFIG.allowedDomains)[number]
        )
      ) {
        throw new BadRequestError(APP_COPY.errors.domainNotAllowed, {
          url,
          domain,
          allowedDomains: REPOSITORY_CONFIG.allowedDomains
        });
      }
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(APP_COPY.errors.invalidUrlFormat, { url });
    }
  }

  private static async fetchFromGitHub(info: RepositoryInfo): Promise<string> {
    const branch = info.branch || REPOSITORY_CONFIG.defaultBranch;
    const rawUrl = `${REPOSITORY_CONFIG.githubRawBaseUrl}/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}/${this.encodeGitRef(branch)}/${this.encodePath(info.filePath)}`;

    this.validateUrl(rawUrl);

    try {
      const response = await axios.get(rawUrl, {
        headers: {
          [HTTP_HEADERS.accept]: HTTP_HEADER_VALUES.githubRaw
        },
        timeout: REPOSITORY_CONFIG.requestTimeoutMs,
        maxRedirects: REPOSITORY_CONFIG.maxRedirects
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NotFoundError(APP_COPY.errors.githubNotFound, {
            owner: info.owner,
            repo: info.repo,
            path: info.filePath,
            branch
          });
        }

        throw new ExternalServiceError(APP_COPY.errors.githubFetchFailed, {
          status: error.response?.status,
          owner: info.owner,
          repo: info.repo,
          path: info.filePath,
          branch,
          message: error.message
        });
      }

      throw new ExternalServiceError(APP_COPY.errors.githubFetchUnexpected, {
        owner: info.owner,
        repo: info.repo,
        path: info.filePath,
        branch
      });
    }
  }

  private static async fetchFromGitLab(info: RepositoryInfo): Promise<string> {
    const branch = info.branch || REPOSITORY_CONFIG.defaultBranch;
    const encodedPath = encodeURIComponent(info.filePath);
    const encodedProject = encodeURIComponent(`${info.owner}/${info.repo}`);
    const apiUrl = `${REPOSITORY_CONFIG.gitlabApiBaseUrl}/projects/${encodedProject}/repository/files/${encodedPath}/raw?ref=${branch}`;

    this.validateUrl(apiUrl);

    try {
      const response = await axios.get(apiUrl, {
        timeout: REPOSITORY_CONFIG.requestTimeoutMs,
        maxRedirects: REPOSITORY_CONFIG.maxRedirects
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NotFoundError(APP_COPY.errors.gitlabNotFound, {
            owner: info.owner,
            repo: info.repo,
            path: info.filePath,
            branch
          });
        }

        throw new ExternalServiceError(APP_COPY.errors.gitlabFetchFailed, {
          status: error.response?.status,
          owner: info.owner,
          repo: info.repo,
          path: info.filePath,
          branch,
          message: error.message
        });
      }

      throw new ExternalServiceError(APP_COPY.errors.gitlabFetchUnexpected, {
        owner: info.owner,
        repo: info.repo,
        path: info.filePath,
        branch
      });
    }
  }

  private static async fetchFromBitbucket(info: RepositoryInfo): Promise<string> {
    const branch = info.branch || REPOSITORY_CONFIG.defaultBranch;
    const rawUrl = `${REPOSITORY_CONFIG.bitbucketRawBaseUrl}/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}/raw/${this.encodeGitRef(branch)}/${this.encodePath(info.filePath)}`;

    this.validateUrl(rawUrl);

    try {
      const response = await axios.get(rawUrl, {
        timeout: REPOSITORY_CONFIG.requestTimeoutMs,
        maxRedirects: REPOSITORY_CONFIG.maxRedirects
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NotFoundError(APP_COPY.errors.bitbucketNotFound, {
            owner: info.owner,
            repo: info.repo,
            path: info.filePath,
            branch
          });
        }

        throw new ExternalServiceError(APP_COPY.errors.bitbucketFetchFailed, {
          status: error.response?.status,
          owner: info.owner,
          repo: info.repo,
          path: info.filePath,
          branch,
          message: error.message
        });
      }

      throw new ExternalServiceError(APP_COPY.errors.bitbucketFetchUnexpected, {
        owner: info.owner,
        repo: info.repo,
        path: info.filePath,
        branch
      });
    }
  }

  static async fetchPipeline(url: string): Promise<{ content: string; detectedCICDType: string | null }> {
    const repoInfo = this.parseRepositoryUrl(url);

    if (!repoInfo) {
      throw new BadRequestError(APP_COPY.errors.invalidRepositoryUrl, { url });
    }

    let content: string;

    switch (repoInfo.platform) {
      case REPOSITORY_PLATFORMS.github:
        content = await this.fetchFromGitHub(repoInfo);
        break;
      case REPOSITORY_PLATFORMS.gitlab:
        content = await this.fetchFromGitLab(repoInfo);
        break;
      case REPOSITORY_PLATFORMS.bitbucket:
        content = await this.fetchFromBitbucket(repoInfo);
        break;
      default:
        throw new BadRequestError(APP_COPY.errors.invalidRepositoryUrl, { platform: repoInfo.platform });
    }

    const detectedCICDType = this.detectCICDType(repoInfo.filePath);

    return {
      content,
      detectedCICDType
    };
  }
}
