export interface ParsedPipeline {
  type: string;
  stages: string[];
  jobs: any[];
  issues: string[];
}

export abstract class CICDParser {
  abstract getName(): string;
  abstract parse(content: string): ParsedPipeline;
  abstract validate(content: string): { valid: boolean; errors: string[] };
}
