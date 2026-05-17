import { APP_COPY } from '../../config/appCopy';
import { CICD_TYPES, CICD_TYPE_IDS } from '../../config/appConfig';
import { GitHubActionsParser } from './GitHubActionsParser';

describe('GitHubActionsParser', () => {
  it('parses GitHub Actions pipelines', () => {
    const parser = new GitHubActionsParser();
    const content = `
name: CI
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Test
        run: npm test
`;

    const parsed = parser.parse(content);
    const label = CICD_TYPES.find((type) => type.id === CICD_TYPE_IDS.githubActions)!.label;
    expect(parsed.type).toBe(label);
    expect(parsed.stages).toEqual(['build']);
    expect(parsed.jobs).toHaveLength(1);
  });

  it('reports missing jobs during validation', () => {
    const parser = new GitHubActionsParser();
    const validation = parser.validate('name: CI');

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(APP_COPY.validation.githubActions.missingJobs);
  });
});
