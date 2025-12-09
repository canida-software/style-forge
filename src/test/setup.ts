// Test setup for style-forge
// This file runs before all tests

// Import types from MapLibre style spec for validation
import type { ExpressionSpecification } from '@maplibre/maplibre-gl-style-spec';

// Extend global type definitions
declare global {
  var testUtils: {
    validateExpression: (expr: any) => boolean;
    isValidExpressionType: (expr: any) => expr is ExpressionSpecification;
    mockFeature: (properties?: Record<string, any>) => any;
    mockZoom: (zoom?: number) => number;
  };
}

// Global test utilities
globalThis.testUtils = {
  // Validate that an expression matches MapLibre format
  validateExpression: (expr: any): boolean => {
    // Basic validation - check if it's an array (MapLibre expressions are arrays)
    return Array.isArray(expr) && expr.length > 0;
  },

  // Check if expression is a valid MapLibre expression type
  isValidExpressionType: (expr: any): expr is ExpressionSpecification => {
    if (!Array.isArray(expr) || expr.length === 0) return false;

    const [operator] = expr;
    // Check if operator is a valid MapLibre expression operator
    const validOperators = [
      'get',
      'has',
      'zoom',
      'literal',
      'match',
      'case',
      'when',
      'interpolate',
      '+',
      '-',
      '*',
      '/',
      '%',
      '^',
      '==',
      '!=',
      '>',
      '>=',
      '<',
      '<=',
      'all',
      'any',
      '!',
      'to-number',
      'to-string',
      'to-boolean',
      'concat',
      'index-of',
      'global-state',
    ];

    return typeof operator === 'string' && validOperators.includes(operator);
  },

  // Mock feature properties for testing
  mockFeature: (properties: Record<string, any> = {}) => ({
    type: 'Feature',
    properties: { id: 123, category: 'residential', magnitude: 5.2, name: 'Test Feature', ...properties },
    geometry: { type: 'Point', coordinates: [0, 0] },
  }),

  // Mock zoom level for testing
  mockZoom: (zoom: number = 10) => zoom,
};
