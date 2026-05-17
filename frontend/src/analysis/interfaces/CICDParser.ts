import type { ParsedPipeline } from '../../types';

export abstract class CICDParser {
  abstract getName(): string;
  abstract parse(content: string): ParsedPipeline;
  abstract validate(content: string): { valid: boolean; errors: string[] };
}
