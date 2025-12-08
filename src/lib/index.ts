export { Value } from './core/expression-builder';
export { ConditionalBuilder } from './core/expression-builder';
export { ConditionalThenBuilder } from './core/expression-builder';
export { MatchBuilder } from './core/expression-builder';
export { MatchFallbackBuilder } from './core/expression-builder';
export { Expression } from './core/expression-builder';
export { Property } from './core/expression-builder';
export { Layer } from './core/expression-builder';

// Re-export utility functions
export {
  get,
  has,
  zoom,
  literal,
  when,
  conditional,
  match,
  add,
  subtract,
  multiply,
  divide,
  mod,
  pow,
  eq,
  neq,
  gt,
  gte,
  lt,
  lte,
  and,
  or,
  not,
  toNumber,
  toString,
  toBoolean,
  concat,
  upcase,
  downcase,
  interpolate,
  step,
} from './core/expression-builder';
