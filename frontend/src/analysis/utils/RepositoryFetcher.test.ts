import { CICD_TYPE_IDS, REPOSITORY_PLATFORMS } from '../../config/appConfig';
import { RepositoryFetcher } from './RepositoryFetcher';

describe('RepositoryFetcher', () => {
  it('parses GitHub repository URLs', () => {
    const info = RepositoryFetcher.parseRepositoryUrl(
      'https://github.com/owner/repo/blob/main/.github/workflows/ci.yml'
    );

    expect(info?.platform).toBe(REPOSITORY_PLATFORMS.github);
    expect(info?.owner).toBe('owner');
    expect(info?.repo).toBe('repo');
    expect(info?.branch).toBe('main');
    expect(info?.filePath).toBe('.github/workflows/ci.yml');
  });

  it('detects GitHub Actions pipelines', () => {
    const detected = RepositoryFetcher.detectCICDType('.github/workflows/ci.yml');
    expect(detected).toBe(CICD_TYPE_IDS.githubActions);
  });
});
