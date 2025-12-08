/**
 * Comprehensive Examples for MapLibre Expression Builder
 *
 * This file demonstrates all the capabilities of the new expression builder system.
 * These examples show how to replace manual expression arrays with type-safe builders.
 */

import { Expression, Property, Value, Layer } from './expression-builder';
import { when, has, get, match, zoom, literal, interpolate } from './expression-builder';

// ============================================================================
// BASIC EXPRESSIONS
// ============================================================================

/**
 * Basic property access expressions
 */
export const basicExpressions = {
  // Get a property value
  getId: Expression.get('id'),

  // Check if property exists
  hasId: Expression.has('id'),

  // Get zoom level
  zoom: Expression.zoom(),

  // Literal values
  literalString: Expression.literal('hello'),
  literalNumber: Expression.literal(42),
};

// ============================================================================
// MATHEMATICAL EXPRESSIONS
// ============================================================================

export const mathExpressions = {
  // Basic arithmetic
  add: Expression.add(1, 2, 3), // 1 + 2 + 3
  subtract: Expression.subtract(10, 3), // 10 - 3
  multiply: Expression.multiply(2, 3, 4), // 2 * 3 * 4
  divide: Expression.divide(10, 2), // 10 / 2

  // Modulo operation (useful for color palettes)
  modulo: Expression.mod(Expression.toNumber(Expression.get('id')), 256),

  // Power function
  power: Expression.pow(2, 8), // 2^8 = 256

  // Complex calculation: (id % 256) + zoom
  complex: Expression.add(Expression.mod(Expression.toNumber(Expression.get('id')), 256), Expression.zoom()),

  // Chaining API for mathematical expressions
  complexChained: Expression.get('id').toNumber().mod(256).add(Expression.zoom()),

  // More complex chaining examples
  calculationChain: Expression.get('magnitude').multiply(10).add(5).divide(2),

  powerChain: Expression.get('level').pow(2).add(Expression.get('bonus')),

  moduloChain: Expression.get('id').toNumber().mod(10).multiply(25).add(50),
};

// ============================================================================
// COMPARISON EXPRESSIONS
// ============================================================================

export const comparisonExpressions = {
  // Equality
  idEqualsZero: Expression.eq(Expression.get('id'), 0),

  // Numeric comparisons
  zoomGreaterThan10: Expression.gt(Expression.zoom(), 10),
  zoomLessThanOrEqual15: Expression.lte(Expression.zoom(), 15),

  // String comparisons
  typeEqualsPolygon: Expression.eq(Expression.get('type'), 'polygon'),

  // Chaining API for comparisons
  idEqualsZeroChained: Expression.get('id').eq(0),
  zoomGreaterThan10Chained: Expression.zoom().gt(10),
  zoomLessThanOrEqual15Chained: Expression.zoom().lte(15),
  typeEqualsPolygonChained: Expression.get('type').eq('polygon'),

  // Complex comparison chains
  complexComparison: Expression.get('magnitude').gte(5).and(Expression.get('magnitude').lt(8)),

  rangeCheck: Expression.zoom().gte(10).and(Expression.zoom().lte(20)),
};

// ============================================================================
// LOGICAL EXPRESSIONS
// ============================================================================

export const logicalExpressions = {
  // AND operation
  hasIdAndVisible: Expression.and(Expression.has('id'), Expression.eq(Expression.get('visible'), true)),

  // OR operation
  isPolygonOrLine: Expression.or(
    Expression.eq(Expression.get('type'), 'polygon'),
    Expression.eq(Expression.get('type'), 'line'),
  ),

  // NOT operation
  notHidden: Expression.not(Expression.eq(Expression.get('status'), 'hidden')),

  // Complex condition
  complexCondition: Expression.and(
    Expression.has('id'),
    Expression.gt(Expression.zoom(), 8),
    Expression.eq(Expression.get('category'), 'important'),
  ),
};

// ============================================================================
// MATCH EXPRESSIONS (Choose Based on Palette Size!)
// ============================================================================

export const matchExpressions = {
  // ✅ RECOMMENDED for object-based mappings: Concise chaining API
  objectBasedPalette: Expression.match(Expression.get('category'))
    .branches({
      residential: '#ffeb3b',
      commercial: '#2196f3',
      industrial: '#f44336',
      // ... add more categories as needed ...
    })
    .fallback('#9e9e9e'),

  // Traditional match expression
  traditionalMatch: Expression.match(
    Expression.mod(Expression.toNumber(Expression.get('id')), 3),
    { 0: '#ff0000', 1: '#00ff00', 2: '#0000ff' },
    '#64748b',
  ),

  // String-based match - traditional
  categoryMatch: Expression.match(
    Expression.get('category'),
    { residential: '#ffeb3b', commercial: '#2196f3', industrial: '#f44336' },
    '#9e9e9e',
  ),
};

// ============================================================================
// CONDITIONAL EXPRESSIONS
// ============================================================================

export const conditionalExpressions = {
  // Traditional case expression
  traditionalCase: Expression.case(Expression.has('id'), '#ff0000', '#0000ff'),

  // When/Then/Else API
  simpleWhenThen: Expression.when(Expression.has('id')).then('#ff0000').else('#0000ff'),

  // Nested conditional with match (complex example)
  nestedCaseMatch: Expression.case(
    Expression.has('id'),
    Expression.match(
      Expression.mod(Expression.toNumber(Expression.get('id')), 256),
      { 0: '#ff0000', 1: '#00ff00', 2: '#0000ff' },
      '#64748b',
    ),
    '#64748b',
  ),

  // When/Then/Else API for nested expressions
  nestedWhenThen: Expression.when(Expression.has('id'))
    .then(
      Expression.match(Expression.get('id').toNumber().mod(256))
        .branches({ 0: '#ff0000', 1: '#00ff00', 2: '#0000ff' })
        .fallback('#64748b'),
    )
    .else('#64748b'),

  // Multi-condition case
  multiConditionCase: Expression.case(
    Expression.and(Expression.has('id'), Expression.gt(Expression.zoom(), 10)),
    Expression.interpolate(['linear'], Expression.zoom(), 10, '#ff0000', 15, '#00ff00'),
    '#64748b',
  ),

  // When/Then/Else API for complex conditions
  complexWhenThen: Expression.when(Expression.has('id').and(Expression.zoom().gt(10)))
    .then(Expression.zoom().interpolate(['linear'], 10, '#ff0000', 15, '#00ff00'))
    .else('#64748b'),

  // Multiple conditions with when/then chains (like SQL CASE)
  multipleConditions: Expression.when(Expression.zoom().lt(5))
    .then('#ff0000')
    .when(Expression.zoom().lt(10))
    .then('#ffff00')
    .when(Expression.zoom().lt(15))
    .then('#00ff00')
    .else('#0000ff'),

  // Comparison-based conditions (like SQL CASE value WHEN ...)
  comparisonBased: Expression.when(Expression.get('category').eq('residential'))
    .then('#ffeb3b')
    .when(Expression.get('category').eq('commercial'))
    .then('#2196f3')
    .when(Expression.get('category').eq('industrial'))
    .then('#f44336')
    .else('#9e9e9e'),
};

// ============================================================================
// INTERPOLATION EXPRESSIONS
// ============================================================================

export const interpolationExpressions = {
  // Linear interpolation by zoom
  zoomBasedOpacity: Expression.interpolate(['linear'], Expression.zoom(), 0, 0.1, 10, 0.5, 20, 1.0),

  // Exponential interpolation
  exponentialSize: Expression.interpolate(['exponential', 2], Expression.get('magnitude'), 0, 5, 10, 20),

  // Cubic bezier interpolation
  smoothColorTransition: Expression.interpolate(
    ['cubic-bezier', 0.25, 0.46, 0.45, 0.94],
    Expression.zoom(),
    0,
    '#ff0000',
    20,
    '#0000ff',
  ),

  // Lab color space interpolation
  labColorInterpolation: Expression.interpolate(
    ['linear'],
    Expression.get('temperature'),
    0,
    '#0000ff',
    50,
    '#ffff00',
    100,
    '#ff0000',
  ),
};

// ============================================================================
// STEP EXPRESSIONS
// ============================================================================

export const stepExpressions = {
  // Step-based line width
  zoomBasedLineWidth: Expression.step(
    Expression.zoom(),
    1, // base value
    5,
    2, // at zoom 5, width becomes 2
    10,
    3, // at zoom 10, width becomes 3
    15,
    4, // at zoom 15, width becomes 4
  ),

  // Step-based size (step expects numeric values)
  magnitudeBasedRadius: Expression.step(
    Expression.get('magnitude'),
    3, // base radius
    3,
    5, // magnitude >= 3: radius 5
    6,
    8, // magnitude >= 6: radius 8
    8,
    12, // magnitude >= 8: radius 12
  ),
};

// ============================================================================
// TYPE CONVERSION EXPRESSIONS
// ============================================================================

export const typeConversionExpressions = {
  // Convert to number
  stringToNumber: Expression.toNumber(Expression.get('id')),

  // Convert to string
  numberToString: Expression.toString(Expression.get('count')),

  // Convert to boolean
  toBoolean: Expression.toBoolean(Expression.get('visible')),
};

// ============================================================================
// STRING EXPRESSIONS
// ============================================================================

export const stringExpressions = {
  // Concatenate strings
  fullName: Expression.concat(Expression.get('firstName'), ' ', Expression.get('lastName')),

  // Case conversion
  uppercase: Expression.upcase(Expression.get('name')),
  lowercase: Expression.downcase(Expression.get('name')),
};

// ============================================================================
// VALUE BUILDERS (For Non-Data-Driven Properties)
// ============================================================================

export const valueBuilders = {
  // Simple literal values
  visibility: Value.literal<'visible' | 'none'>('visible'),

  // Camera-based expressions (zoom-dependent but not data-driven)
  zoomBasedLineWidth: Value.expression(Expression.interpolate(['linear'], Expression.zoom(), 10, 1, 20, 5)),

  // Camera function for dynamic behavior based on viewing parameters
  cameraBasedSize: Value.cameraFunction({
    type: 'exponential',
    stops: [
      [0, 1],
      [20, 32],
    ],
  }),
};

// ============================================================================
// PROPERTY BUILDERS (For Data-Driven Layer Properties)
// ============================================================================

export const propertyBuilders = {
  // Fill color with data-driven expression
  fillColor: Property.match(
    Expression.mod(Expression.toNumber(Expression.get('id')), 256),
    { 0: '#ff0000', 1: '#00ff00', 2: '#0000ff' },
    '#64748b',
  ),

  // Opacity with interpolation
  fillOpacity: Property.interpolate(['linear'], Expression.zoom(), 0, 0.1, 15, 0.8),

  // Circle radius with step function
  circleRadius: Property.step(Expression.get('magnitude'), 3, 5, 5, 8, 10),

  // Line width based on zoom
  lineWidth: Property.interpolate(['linear'], Expression.zoom(), 0, 1, 20, 5),

  // Text size with case logic
  textSize: Property.case(Expression.gt(Expression.zoom(), 12), 14, 10),
};

// ============================================================================
// LAYER BUILDERS (Complete Layer Specifications)
// ============================================================================

export const layerBuilders = {
  // Fill layer with data-driven coloring
  fillLayer: new Layer('fill', 'buildings-fill', 'buildings-source', 'buildings')
    .fillColor(propertyBuilders.fillColor.build())
    .fillOpacity(propertyBuilders.fillOpacity.build())
    .visibility('visible')
    .minZoom(0)
    .maxZoom(20),

  // ✅ RECOMMENDED: Concise chaining API for large palettes
  fillLayerConcise: new Layer('fill', 'buildings-concise', 'buildings-source', 'buildings')
    .fillColor(
      Property.expression<string>(
        Expression.when(Expression.has('id'))
          .then(
            Expression.match(Expression.get('id').toNumber().mod(256))
              .branches({
                0: '#ff0000',
                1: '#00ff00',
                2: '#0000ff',
                // ... 253 more colors programmatically generated ...
              })
              .fallback('#64748b'),
          )
          .else('#64748b'),
      ).build(),
    )
    .fillOpacity(0.8)
    .visibility('visible'),

  // Array-based large palettes
  fillLayerColorPalette: new Layer('fill', 'buildings-palette', 'buildings-source', 'buildings')
    .fillColor(
      Property.expression<string>(
        Expression.when(Expression.has('id'))
          .then(
            Expression.match(
              Expression.mod(Expression.toNumber(Expression.get('id')), 256),
              {
                0: '#ff0000',
                1: '#00ff00',
                2: '#0000ff',
                // ... 253 more colors programmatically generated ...
              },
              '#64748b',
            ),
          )
          .else('#64748b'),
      ).build(),
    )
    .fillOpacity(0.8)
    .visibility('visible'),

  // Circle layer for points
  circleLayer: new Layer('circle', 'points-circle', 'points-source')
    .circleColor('#ff0000')
    .circleRadius(5)
    .visibility('visible'),

  // Line layer with zoom-based styling
  lineLayer: new Layer('line', 'roads-line', 'roads-source', 'roads')
    .lineColor(Property.literal('#666666').build())
    .lineWidth(propertyBuilders.lineWidth.build())
    .visibility('visible'),

  // Symbol layer with text
  symbolLayer: new Layer('symbol', 'labels-symbol', 'buildings-source', 'buildings')
    .textField(['get', 'name'])
    .textSize(12)
    .visibility('visible')
    .minZoom(10),

  // Complex layer with filters
  filteredLayer: new Layer('fill', 'filtered-fill', 'data-source', 'layer')
    .fillColor(propertyBuilders.fillColor.build())
    .filter(Expression.and(Expression.has('id'), Expression.gt(Expression.get('area'), 1000)).build())
    .visibility('visible'),
};

// ============================================================================
// DIRECT IMPORTS - Ergonomic usage without Expression. prefix
// ============================================================================

export const directImportExamples = {
  // Much more ergonomic - no Expression. prefix needed!
  ergonomicWhenThen: when(has('id')).then('#ff0000').else('#0000ff'),

  // Direct function calls
  directGet: get('category'),
  directHas: has('id'),
  directZoom: zoom(),
  directLiteral: literal('hello'),

  // Fluent chaining with direct imports
  chainedMath: get('magnitude').toNumber().multiply(10).add(5).divide(2),

  // Match expressions with direct imports
  directMatch: match(get('category'))
    .branches({ residential: '#ffeb3b', commercial: '#2196f3', industrial: '#f44336' })
    .fallback('#9e9e9e'),

  // Comparison and conditional logic
  directComparison: get('value').eq(100),
  directCase: when(has('id')).then('#ff0000').else('#0000ff'),

  // Interpolation with direct imports
  directInterpolate: interpolate(['linear'], zoom(), 0, 0.1, 20, 1.0),
};
