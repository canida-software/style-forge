import { Expression } from './core/expression-builder.js';

export { Expression } from './core/expression-builder.js';
export { Value } from './core/expression-builder.js';
export { ConditionalBuilder } from './core/expression-builder.js';
export { ConditionalThenBuilder } from './core/expression-builder.js';
export { MatchBuilder } from './core/expression-builder.js';
export { MatchFallbackBuilder } from './core/expression-builder.js';
export { LetBuilder } from './core/expression-builder.js';

export { Property } from './core/expression-builder.js';
export type { VarBindings } from './core/expression-builder.js';
export { Layer } from './core/expression-builder.js';

// Direct exports for ergonomic usage without Expression. prefix
export const fx = Expression; // Alias for Expression
export const get = Expression.get;
export const has = Expression.has;
export const zoom = Expression.zoom;
export const literal = Expression.literal;
export const globalState = Expression.globalState;
export const elevation = Expression.elevation;

// Conditional expressions
export const when = Expression.when;
export const conditional = Expression.conditional; // alias for when

// Match expressions
export const match = Expression.match;

// Variable binding expressions
export const $let = Expression.$let;
export const $var = Expression.var;

// Mathematical operations
export const add = Expression.add;
export const subtract = Expression.subtract;
export const multiply = Expression.multiply;
export const divide = Expression.divide;
export const mod = Expression.mod;
export const pow = Expression.pow;

// Mathematical constants
export const pi = Expression.pi;
export const e = Expression.e;
export const ln2 = Expression.ln2;

// Comparison operations
export const eq = Expression.eq;
export const neq = Expression.neq;
export const gt = Expression.gt;
export const gte = Expression.gte;
export const lt = Expression.lt;
export const lte = Expression.lte;

// Logical operations
export const and = Expression.and;
export const or = Expression.or;
export const not = Expression.not;

// Type conversion
export const toNumber = Expression.toNumber;
export const toString = Expression.toString;
export const toBoolean = Expression.toBoolean;
export const toColor = Expression.toColor;

// Type assertions
export const string = Expression.string;
export const number = Expression.number;
export const boolean = Expression.boolean;
export const array = Expression.array;
export const object = Expression.object;

// Type checking
export const typeOf = Expression.typeof;

// Type system
export const coalesce = Expression.coalesce;

// Advanced type expressions
export const collator = Expression.collator;
export const format = Expression.format;

// String operations
export const concat = Expression.concat;
export const upcase = Expression.upcase;
export const downcase = Expression.downcase;

// Interpolation and stepping
export const interpolate = Expression.interpolate;
export const step = Expression.step;
