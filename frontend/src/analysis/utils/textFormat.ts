export const formatTemplate = (template: string, params: Record<string, string>): string => {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => params[key] ?? '');
};
