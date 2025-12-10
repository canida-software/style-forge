/**
 * Comprehensive Examples for MapLibre Expression Builder
 *
 * This file demonstrates all the capabilities of the new expression builder system.
 * These examples show how to replace manual expression arrays with type-safe builders.
 */
import { Expression, Property, Value, Layer } from './expression-builder.js';
import { when, has, get, match, zoom, literal, interpolate } from '../index.js';
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
    // Mathematical constants (accessed via static methods since they don't chain)
    pi: Expression.pi(), // π ≈ 3.14159
    e: Expression.e(), // e ≈ 2.71828
    ln2: Expression.ln2(), // ln(2) ≈ 0.69315
    // Complex calculation: (id % 256) + zoom
    complex: Expression.add(Expression.mod(Expression.toNumber(Expression.get('id')), 256), Expression.zoom()),
    // Chaining API for mathematical expressions
    complexChained: Expression.get('id').toNumber().mod(256).add(Expression.zoom()),
    // More complex chaining examples
    calculationChain: Expression.get('magnitude').multiply(10).add(5).divide(2),
    powerChain: Expression.get('level').pow(2).add(Expression.get('bonus')),
    moduloChain: Expression.get('id').toNumber().mod(10).multiply(25).add(50),
    // Square root and logarithm chaining
    sqrtChain: Expression.get('area').sqrt().multiply(2),
    log10Chain: Expression.get('magnitude').log10().add(1).divide(2),
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
    isPolygonOrLine: Expression.or(Expression.eq(Expression.get('type'), 'polygon'), Expression.eq(Expression.get('type'), 'line')),
    // NOT operation
    notHidden: Expression.not(Expression.eq(Expression.get('status'), 'hidden')),
    // Complex condition
    complexCondition: Expression.and(Expression.has('id'), Expression.gt(Expression.zoom(), 8), Expression.eq(Expression.get('category'), 'important')),
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
};
// ============================================================================
// CONDITIONAL EXPRESSIONS
// ============================================================================
export const conditionalExpressions = {
    // When/Then/Else API
    simpleWhenThen: Expression.when(Expression.has('id')).then('#ff0000').else('#0000ff'),
    // When/Then/Else API for nested expressions
    nestedWhenThen: Expression.when(Expression.has('id'))
        .then(Expression.match(Expression.get('id').toNumber().mod(256))
        .branches({ 0: '#ff0000', 1: '#00ff00', 2: '#0000ff' })
        .fallback('#64748b'))
        .else('#64748b'),
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
    smoothColorTransition: Expression.interpolate(['cubic-bezier', 0.25, 0.46, 0.45, 0.94], Expression.zoom(), 0, '#ff0000', 20, '#0000ff'),
    // Lab color space interpolation
    labColorInterpolation: Expression.interpolate(['linear'], Expression.get('temperature'), 0, '#0000ff', 50, '#ffff00', 100, '#ff0000'),
};
// ============================================================================
// STEP EXPRESSIONS
// ============================================================================
export const stepExpressions = {
    // Step-based line width
    zoomBasedLineWidth: Expression.step(Expression.zoom(), 1, // base value
    5, 2, // at zoom 5, width becomes 2
    10, 3, // at zoom 10, width becomes 3
    15, 4),
    // Step-based size (step expects numeric values)
    magnitudeBasedRadius: Expression.step(Expression.get('magnitude'), 3, // base radius
    3, 5, // magnitude >= 3: radius 5
    6, 8, // magnitude >= 6: radius 8
    8, 12),
};
// ============================================================================
// TYPE CONVERSION EXPRESSIONS
// ============================================================================
export const typeConversionExpressions = {
    // ✅ ONLY: Fluent API for all type operations
    // Type conversions - fluent API
    idAsNumber: Expression.get('id').toNumber(),
    countAsString: Expression.get('count').toString(),
    visibleAsBoolean: Expression.get('visible').toBoolean(),
    colorValue: Expression.literal('red').toColor(),
    // Type assertions (ensure value is of specific type) - fluent API
    nameAsString: Expression.get('name').string(),
    countAsNumber: Expression.get('count').number(),
    visibleAsBooleanTyped: Expression.get('visible').boolean(),
    tagsAsArray: Expression.get('tags').array(),
    tagsAsStringArray: Expression.get('tags').array('string'), // typed array
    metadataAsObject: Expression.get('metadata').object(),
    // Type checking - fluent API
    valueType: Expression.get('value').typeof(),
    // Coalesce - fluent API for robust fallbacks
    primaryColorOrDefault: Expression.get('primaryColor').coalesce(Expression.get('secondaryColor'), '#64748b'),
    nameOrPlaceholder: Expression.get('name').coalesce('Unknown'),
    // Advanced fluent type operations
    safeProcessing: Expression.get('userInput')
        .coalesce('default') // fallback
        .toString() // ensure string
        .string(), // assert string type
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
// LOOKUP EXPRESSIONS - FLUENT API ONLY
// ============================================================================
export const lookupExpressions = {
    // ✅ ONLY: Fluent API for all lookup operations
    // Length of strings and arrays - use fluent API
    nameLength: Expression.get('name').length(),
    tagsLength: Expression.get('tags').length(),
    // Check if value exists in array or string - fluent API
    hasImportantTag: Expression.literal('important').in(Expression.get('tags')),
    containsLetterA: Expression.literal('a').in(Expression.get('name')),
    // Access elements by index (0-based) - fluent API
    firstTag: Expression.get('tags').at(0),
    firstNameChar: Expression.get('name').at(0),
    // Extract substrings/subarrays - fluent API
    namePrefix: Expression.get('name').slice(0, 3),
    firstTwoTags: Expression.get('tags').slice(0, 2),
    nameFromThirdChar: Expression.get('name').slice(2), // from index 2 to end
    // Find position of items in arrays/strings - fluent API
    urgentTagIndex: Expression.get('tags').indexOf('urgent'),
    letterPosition: Expression.get('name').indexOf('a'),
    searchFromIndex: Expression.get('tags').indexOf('important', 1), // start search from index 1
    // Complex fluent expressions - this is where fluent API shines
    conditionalSlice: Expression.when(Expression.get('name').length().gt(5))
        .then(Expression.get('name').slice(0, 5).concat('...'))
        .else(Expression.get('name')),
    tagBasedColor: Expression.when(Expression.literal('urgent').in(Expression.get('tags')))
        .then('#ff0000')
        .else('#0000ff'),
    // Advanced fluent chaining
    processTags: Expression.get('tags')
        .slice(0, 3) // take first 3 tags
        .concat(Expression.get('categories').slice(0, 2)), // add first 2 categories
};
// ============================================================================
// GLOBAL STATE EXPRESSIONS
// ============================================================================
export const globalStateExpressions = {
    // Access global state properties - static API since no chaining context
    themeColor: Expression.globalState('theme'),
    userPreferences: Expression.globalState('preferences'),
    appConfig: Expression.globalState('config'),
    // Use global state in conditional expressions
    themeBasedColor: Expression.when(Expression.globalState('darkMode')).then('#ffffff').else('#000000'),
    // Combine global state with feature data
    dynamicSize: Expression.add(Expression.get('baseSize'), Expression.globalState('sizeMultiplier')),
    // Global state in match expressions
    categoryColor: Expression.match(Expression.get('category'))
        .branches({
        residential: Expression.globalState('residentialColor'),
        commercial: Expression.globalState('commercialColor'),
        industrial: Expression.globalState('industrialColor'),
    })
        .fallback('#64748b'),
};
// ============================================================================
// VALUE BUILDERS (For Non-Data-Driven Properties)
// ============================================================================
export const valueBuilders = {
    // Simple literal values
    visibility: Value.literal('visible'),
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
    // Fill color with data-driven expression using fluent API
    fillColor: Property.expression(Expression.match(Expression.mod(Expression.toNumber(Expression.get('id')), 256))
        .branches({ 0: '#ff0000', 1: '#00ff00', 2: '#0000ff' })
        .fallback('#64748b')),
    // Opacity with interpolation
    fillOpacity: Property.interpolate(['linear'], Expression.zoom(), 0, 0.1, 15, 0.8),
    // Circle radius with step function
    circleRadius: Property.step(Expression.get('magnitude'), 3, 5, 5, 8, 10),
    // Line width based on zoom
    lineWidth: Property.interpolate(['linear'], Expression.zoom(), 0, 1, 20, 5),
    // Text size with conditional logic using fluent API
    textSize: Property.expression(Expression.when(Expression.zoom().gt(12)).then(14).else(10)),
};
// ============================================================================
// LAYER BUILDERS (Complete Layer Specifications)
// ============================================================================
export const layerBuilders = {
    // Fill layer with data-driven coloring
    fillLayer: new Layer('fill', 'buildings-fill', 'buildings-source', 'buildings')
        .fillColor(propertyBuilders.fillColor.forge())
        .fillOpacity(propertyBuilders.fillOpacity.forge())
        .visibility('visible')
        .minZoom(0)
        .maxZoom(20),
    // ✅ RECOMMENDED: Concise chaining API for large palettes
    fillLayerConcise: new Layer('fill', 'buildings-concise', 'buildings-source', 'buildings')
        .fillColor(Property.expression(Expression.when(Expression.has('id'))
        .then(Expression.match(Expression.get('id').toNumber().mod(256))
        .branches({
        0: '#ff0000',
        1: '#00ff00',
        2: '#0000ff',
        // ... 253 more colors programmatically generated ...
    })
        .fallback('#64748b'))
        .else('#64748b')).forge())
        .fillOpacity(0.8)
        .visibility('visible'),
    // Array-based large palettes using fluent API
    fillLayerColorPalette: new Layer('fill', 'buildings-palette', 'buildings-source', 'buildings')
        .fillColor(Property.expression(Expression.when(Expression.has('id'))
        .then(Expression.match(Expression.mod(Expression.toNumber(Expression.get('id')), 256))
        .branches({
        0: '#ff0000',
        1: '#00ff00',
        2: '#0000ff',
        // ... 253 more colors programmatically generated ...
    })
        .fallback('#64748b'))
        .else('#64748b')).forge())
        .fillOpacity(0.8)
        .visibility('visible'),
    // Circle layer for points
    circleLayer: new Layer('circle', 'points-circle', 'points-source')
        .circleColor('#ff0000')
        .circleRadius(5)
        .visibility('visible'),
    // Line layer with zoom-based styling
    lineLayer: new Layer('line', 'roads-line', 'roads-source', 'roads')
        .lineColor(Property.literal('#666666').forge())
        .lineWidth(propertyBuilders.lineWidth.forge())
        .visibility('visible'),
    // Symbol layer with text
    symbolLayer: new Layer('symbol', 'labels-symbol', 'buildings-source', 'buildings')
        .textField(['get', 'name'])
        .textSize(12)
        .visibility('visible')
        .minZoom(10),
    // Complex layer with filters
    filteredLayer: new Layer('fill', 'filtered-fill', 'data-source', 'layer')
        .fillColor(propertyBuilders.fillColor.forge())
        .filter(Expression.and(Expression.has('id'), Expression.gt(Expression.get('area'), 1000)).forge())
        .visibility('visible'),
};
// ============================================================================
// ADVANCED TYPE EXPRESSIONS
// ============================================================================
export const advancedTypeExpressions = {
    // Collator for locale-aware string comparison
    collatorDefault: Expression.collator(),
    collatorCaseSensitive: Expression.collator({ 'case-sensitive': true }),
    collatorLocale: Expression.collator({ locale: 'fr-FR' }),
    collatorFull: Expression.collator({ 'case-sensitive': false, 'diacritic-sensitive': true, locale: 'de-DE' }),
    // Image references for sprite images
    imageDynamic: get('iconName').image(),
    imageLiteral: literal('marker-icon').image(),
    // Number formatting with localization
    numberFormatDynamic: get('price').numberFormat({ locale: 'en-US', currency: 'USD' }),
    numberFormatLiteral: literal(1234.56).numberFormat({ locale: 'de-DE' }),
    numberFormatPrecision: literal(123.456789).numberFormat({ 'min-fraction-digits': 2, 'max-fraction-digits': 4 }),
    // Rich text formatting
    formatSimple: Expression.format('Hello', ' ', 'World'),
    formatWithData: Expression.format('Population: ', get('population'), ' people'),
    formatWithFormatting: Expression.format('Price: ', { 'text-color': '#ff0000', 'font-scale': 1.2 }),
    formatComplex: Expression.format('Area: ', get('area').numberFormat({ locale: 'en-US' }), ' sq km', {
        'text-color': '#0066cc',
        'font-scale': 0.8,
        'vertical-align': 'bottom',
    }),
    formatWithFont: Expression.format('Warning: ', {
        'text-color': '#ff6600',
        'text-font': Expression.literal(['Arial Bold']),
        'font-scale': 1.1,
    }),
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
    // New math expressions with fluent API
    sqrtExample: get('area').sqrt(),
    log10Example: get('magnitude').log10(),
    // Match expressions with direct imports
    directMatch: match(get('category'))
        .branches({ residential: '#ffeb3b', commercial: '#2196f3', industrial: '#f44336' })
        .fallback('#9e9e9e'),
    // Comparison and conditional logic
    directComparison: get('value').eq(100),
    directWhenThen: when(has('id')).then('#ff0000').else('#0000ff'),
    // Interpolation with direct imports
    directInterpolate: interpolate(['linear'], zoom(), 0, 0.1, 20, 1.0),
};
