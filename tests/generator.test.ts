import { describe, it, expect } from 'vitest';
import { renderTemplate, formatCode } from '../src/lib/generator';

describe('Generator', () => {
  describe('renderTemplate', () => {
    it('should render a template with context variables', () => {
      const template = 'Project: {{ projectName }}, Author: {{ author }}';
      const context = { projectName: 'test-app', author: 'John Doe' };

      const result = renderTemplate(template, context);
      expect(result).toBe('Project: test-app, Author: John Doe');
    });

    it('should handle missing variables gracefully', () => {
      const template = 'Project: {{ projectName }}';
      const context = {};

      const result = renderTemplate(template, context);
      expect(result).toBe('Project: ');
    });
  });

  describe('formatCode', () => {
    it('should format TypeScript code with Prettier', async () => {
      const unformatted = 'const x=1;const y=2;';
      const formatted = await formatCode(unformatted, 'typescript');

      expect(formatted).toContain('const x = 1;');
      expect(formatted).toContain('const y = 2;');
    });

    it('should format JSON with Prettier', async () => {
      const unformatted = '{"name":"test","version":"1.0.0"}';
      const formatted = await formatCode(unformatted, 'json');

      expect(formatted).toContain('"name": "test"');
      expect(formatted).toContain('"version": "1.0.0"');
    });
  });
});
