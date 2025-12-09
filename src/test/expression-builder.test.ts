import { describe, it, expect } from 'vitest';
import {
  get,
  has,
  zoom,
  literal,
  match,
  when,
  interpolate,
  add,
  multiply,
  pi,
  e,
  ln2,
  eq,
  gt,
  gte,
  and,
  not,
  toNumber,
  toString,
  toColor,
  string,
  number,
  boolean,
  array,
  object,
  typeOf,
  coalesce,
  concat,
  upcase,
  downcase,
  globalState,
  collator,
  format,
  $let,
  $var,
  elevation,
} from 'style-forge';

describe('Expression Builder - Basic Expressions', () => {
  it('should create get expressions', () => {
    const expr = get('category');
    expect(expr.build()).toEqual(['get', 'category']);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create has expressions', () => {
    const expr = has('id');
    expect(expr.build()).toEqual(['has', 'id']);
  });

  it('should create zoom expressions', () => {
    const expr = zoom();
    expect(expr.build()).toEqual(['zoom']);
  });

  it('should create literal expressions', () => {
    const expr = literal('hello');
    expect(expr.build()).toEqual(['literal', 'hello']);
  });

  it('should create numeric literal expressions', () => {
    const expr = literal(42);
    expect(expr.build()).toEqual(['literal', 42]);
  });

  it('should create elevation expressions', () => {
    const expr = elevation();
    expect(expr.build()).toEqual(['elevation']);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);

    // Edge case: Use in a larger expression
    const combined = elevation().add(1000).interpolate(['linear'], 0, '#000000', 5000, '#ffffff');
    expect(combined.build()).toEqual([
      'interpolate',
      ['linear'],
      ['+', ['elevation'], 1000],
      0,
      '#000000',
      5000,
      '#ffffff',
    ]);
    expect(globalThis.testUtils.validateExpression(combined.build())).toBe(true);
  });
});

describe('Expression Builder - Mathematical Expressions', () => {
  it('should create addition expressions', () => {
    const expr = add(1, 2, 3);
    expect(expr.build()).toEqual(['+', 1, 2, 3]);
  });

  it('should create multiplication expressions', () => {
    const expr = multiply(2, 3, 4);
    expect(expr.build()).toEqual(['*', 2, 3, 4]);
  });

  it('should chain mathematical operations', () => {
    const expr = get('magnitude').multiply(10).add(5).divide(2);
    expect(expr.build()).toEqual(['/', ['+', ['*', ['get', 'magnitude'], 10], 5], 2]);
  });

  it('should create power expressions', () => {
    const expr = get('level').pow(2);
    expect(expr.build()).toEqual(['^', ['get', 'level'], 2]);
  });

  it('should create square root expressions', () => {
    const expr = get('area').sqrt();
    expect(expr.build()).toEqual(['sqrt', ['get', 'area']]);
  });

  it('should create log10 expressions', () => {
    const expr = get('magnitude').log10();
    expect(expr.build()).toEqual(['log10', ['get', 'magnitude']]);
  });

  it('should create mathematical constants', () => {
    expect(pi().build()).toEqual(['pi']);
    expect(e().build()).toEqual(['e']);
    expect(ln2().build()).toEqual(['ln2']);
  });
});

describe('Expression Builder - Comparison Expressions', () => {
  it('should create equality expressions', () => {
    const expr = eq(get('category'), 'residential');
    expect(expr.build()).toEqual(['==', ['get', 'category'], 'residential']);
  });

  it('should create greater than expressions', () => {
    const expr = gt(zoom(), 10);
    expect(expr.build()).toEqual(['>', ['zoom'], 10]);
  });

  it('should create greater than or equal expressions', () => {
    const expr = gte(get('magnitude'), 5);
    expect(expr.build()).toEqual(['>=', ['get', 'magnitude'], 5]);
  });

  it('should chain comparison operations', () => {
    const expr = get('magnitude').gte(5).and(get('magnitude').lt(8));
    expect(expr.build()).toEqual(['all', ['>=', ['get', 'magnitude'], 5], ['<', ['get', 'magnitude'], 8]]);
  });
});

describe('Expression Builder - Logical Expressions', () => {
  it('should create and (AND) expressions', () => {
    const expr = and(has('id'), eq(get('visible'), true));
    expect(expr.build()).toEqual(['all', ['has', 'id'], ['==', ['get', 'visible'], true]]);
  });

  it('should create not expressions', () => {
    const expr = not(eq(get('status'), 'hidden'));
    expect(expr.build()).toEqual(['!', ['==', ['get', 'status'], 'hidden']]);
  });

  it('should chain logical operations', () => {
    const expr = has('id')
      .and(zoom().gt(8))
      .and(eq(get('category'), 'important'));
    // Note: chaining creates nested 'all' expressions
    expect(expr.build()).toEqual([
      'all',
      ['all', ['has', 'id'], ['>', ['zoom'], 8]],
      ['==', ['get', 'category'], 'important'],
    ]);
  });
});

describe('Expression Builder - Match Expressions', () => {
  it('should create match expressions with branches', () => {
    const expr = match(get('category'))
      .branches({ residential: '#ffeb3b', commercial: '#2196f3', industrial: '#f44336' })
      .fallback('#9e9e9e');

    expect(expr.build()).toEqual([
      'match',
      ['get', 'category'],
      'residential',
      '#ffeb3b',
      'commercial',
      '#2196f3',
      'industrial',
      '#f44336',
      '#9e9e9e',
    ]);
  });

  it('should create match expressions with numeric keys', () => {
    const expr = match(get('level').mod(3)).branches({ 0: 'low', 1: 'medium', 2: 'high' }).fallback('unknown');

    expect(expr.build()).toEqual(['match', ['%', ['get', 'level'], 3], 0, 'low', 1, 'medium', 2, 'high', 'unknown']);
  });
});

describe('Expression Builder - Conditional Expressions', () => {
  it('should create when-then-else expressions', () => {
    const expr = when(has('id')).then('#ff0000').else('#0000ff');
    expect(expr.build()).toEqual(['case', ['has', 'id'], '#ff0000', '#0000ff']);
  });

  it('should create chained conditional expressions', () => {
    const expr = when(zoom().lt(5)).then('#ff0000').when(zoom().lt(10)).then('#ffff00').else('#0000ff');

    expect(expr.build()).toEqual(['case', ['<', ['zoom'], 5], '#ff0000', ['<', ['zoom'], 10], '#ffff00', '#0000ff']);
  });

  it('should create complex nested conditionals', () => {
    const expr = when(has('id'))
      .then(match(get('category')).branches({ residential: '#ffeb3b', commercial: '#2196f3' }).fallback('#9e9e9e'))
      .else('#64748b');

    expect(expr.build()).toEqual([
      'case',
      ['has', 'id'],
      ['match', ['get', 'category'], 'residential', '#ffeb3b', 'commercial', '#2196f3', '#9e9e9e'],
      '#64748b',
    ]);
  });
});

describe('Expression Builder - Interpolation Expressions', () => {
  it('should create linear interpolation expressions', () => {
    const expr = interpolate(['linear'], zoom(), 0, 0.1, 10, 0.5, 20, 1.0);
    expect(expr.build()).toEqual(['interpolate', ['linear'], ['zoom'], 0, 0.1, 10, 0.5, 20, 1.0]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create exponential interpolation expressions', () => {
    const expr = interpolate(['exponential', 2], get('magnitude'), 0, 5, 10, 50);
    expect(expr.build()).toEqual(['interpolate', ['exponential', 2], ['get', 'magnitude'], 0, 5, 10, 50]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create HCL color interpolation expressions', () => {
    const expr = get('value').interpolateHcl(0, '#ff0000', 1, '#00ff00');
    expect(expr.build()).toEqual(['interpolate-hcl', ['get', 'value'], 0, '#ff0000', 1, '#00ff00']);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);

    // Edge case: Multiple stops and expression input
    const complex = zoom().interpolateHcl(5, '#000', 10, '#fff', 15, '#f00');
    expect(complex.build()).toEqual(['interpolate-hcl', ['zoom'], 5, '#000', 10, '#fff', 15, '#f00']);
    expect(globalThis.testUtils.validateExpression(complex.build())).toBe(true);
  });

  it('should create Lab color interpolation expressions', () => {
    const expr = get('value').interpolateLab(0, '#ff0000', 1, '#00ff00');
    expect(expr.build()).toEqual(['interpolate-lab', ['get', 'value'], 0, '#ff0000', 1, '#00ff00']);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);

    // Edge case: Minimal stops
    const minimal = literal(0.5).interpolateLab(0, '#000', 1, '#fff');
    expect(minimal.build()).toEqual(['interpolate-lab', ['literal', 0.5], 0, '#000', 1, '#fff']);
    expect(globalThis.testUtils.validateExpression(minimal.build())).toBe(true);
  });
});

describe('Expression Builder - Type Conversion Expressions', () => {
  it('should create to-number expressions', () => {
    const expr = toNumber(get('id'));
    expect(expr.build()).toEqual(['to-number', ['get', 'id']]);
  });

  it('should create to-string expressions', () => {
    const expr = toString(get('count'));
    expect(expr.build()).toEqual(['to-string', ['get', 'count']]);
  });

  it('should chain type conversion with other operations', () => {
    const expr = get('id').toNumber().mod(256);
    expect(expr.build()).toEqual(['%', ['to-number', ['get', 'id']], 256]);
  });
});

describe('Expression Builder - Type System Expressions', () => {
  it('should create to-color expressions', () => {
    const expr = toColor('red');
    expect(expr.build()).toEqual(['to-color', 'red']);
  });

  it('should create string type assertion expressions', () => {
    const expr = string(get('name'));
    expect(expr.build()).toEqual(['string', ['get', 'name']]);
  });

  it('should create number type assertion expressions', () => {
    const expr = number(get('count'));
    expect(expr.build()).toEqual(['number', ['get', 'count']]);
  });

  it('should create boolean type assertion expressions', () => {
    const expr = boolean(get('visible'));
    expect(expr.build()).toEqual(['boolean', ['get', 'visible']]);
  });

  it('should create array type assertion expressions', () => {
    const expr = array(get('tags'));
    expect(expr.build()).toEqual(['array', ['get', 'tags']]);
  });

  it('should create array type assertion expressions with item type', () => {
    const expr = array(get('tags'), 'string');
    expect(expr.build()).toEqual(['array', 'string', ['get', 'tags']]);
  });

  it('should create object type assertion expressions', () => {
    const expr = object(get('metadata'));
    expect(expr.build()).toEqual(['object', ['get', 'metadata']]);
  });

  it('should create typeof expressions', () => {
    const expr = typeOf(get('value'));
    expect(expr.build()).toEqual(['typeof', ['get', 'value']]);
  });

  it('should create coalesce expressions', () => {
    const expr = coalesce(get('primaryColor'), get('secondaryColor'), '#64748b');
    expect(expr.build()).toEqual(['coalesce', ['get', 'primaryColor'], ['get', 'secondaryColor'], '#64748b']);
  });

  it('should chain type system expressions', () => {
    const expr = get('color').toColor();
    expect(expr.build()).toEqual(['to-color', ['get', 'color']]);
  });

  it('should chain type assertions', () => {
    const expr = get('tags').array('string');
    expect(expr.build()).toEqual(['array', 'string', ['get', 'tags']]);
  });
});

describe('Expression Builder - String Expressions', () => {
  it('should create concat expressions', () => {
    const expr = concat(get('firstName'), ' ', get('lastName'));
    expect(expr.build()).toEqual(['concat', ['get', 'firstName'], ' ', ['get', 'lastName']]);
  });

  it('should create upcase expressions', () => {
    const expr = upcase(get('name'));
    expect(expr.build()).toEqual(['upcase', ['get', 'name']]);
  });

  it('should create downcase expressions', () => {
    const expr = downcase(get('name'));
    expect(expr.build()).toEqual(['downcase', ['get', 'name']]);
  });
});

describe('Expression Builder - Complex Real-World Examples', () => {
  it('should create earthquake visualization expressions', () => {
    // Color based on magnitude ranges
    const colorByMagnitude = when(get('magnitude').gte(7))
      .then('#ff0000')
      .when(get('magnitude').gte(5))
      .then('#ff8800')
      .when(get('magnitude').gte(3))
      .then('#ffff00')
      .else('#00ff00');

    expect(colorByMagnitude.build()).toEqual([
      'case',
      ['>=', ['get', 'magnitude'], 7],
      '#ff0000',
      ['>=', ['get', 'magnitude'], 5],
      '#ff8800',
      ['>=', ['get', 'magnitude'], 3],
      '#ffff00',
      '#00ff00',
    ]);
  });

  it('should create adaptive sizing based on zoom and properties', () => {
    const adaptiveSize = when(zoom().gt(12)).then(get('area').multiply(0.01).add(5)).else(8);

    expect(adaptiveSize.build()).toEqual(['case', ['>', ['zoom'], 12], ['+', ['*', ['get', 'area'], 0.01], 5], 8]);
  });

  it('should create large color palette with ID-based coloring', () => {
    const colorPalette = when(has('id'))
      .then(
        match(get('id').toNumber().mod(256))
          .branches({
            0: '#ff0000',
            1: '#00ff00',
            2: '#0000ff',
            3: '#ffff00',
            4: '#ff00ff',
            5: '#00ffff',
            6: '#800080',
            7: '#ffa500',
          })
          .fallback('#64748b'),
      )
      .else('#64748b');

    const result = colorPalette.build() as any[];
    expect(result[0]).toBe('case');
    expect(result[1]).toEqual(['has', 'id']);
    expect(Array.isArray(result[2])).toBe(true);
    expect(result[2][0]).toBe('match');
    expect(result[3]).toBe('#64748b');
  });
});

describe('Expression Builder - Lookup Expressions', () => {
  it('should chain length expressions', () => {
    const expr = get('name').length();
    expect(expr.build()).toEqual(['length', ['get', 'name']]);
  });

  it('should chain at expressions', () => {
    const expr = get('tags').at(0);
    expect(expr.build()).toEqual(['at', 0, ['get', 'tags']]);
  });

  it('should chain slice expressions', () => {
    const expr = get('name').slice(0, 3);
    expect(expr.build()).toEqual(['slice', ['get', 'name'], 0, 3]);
  });

  it('should chain slice expressions with only start', () => {
    const expr = get('name').slice(2);
    expect(expr.build()).toEqual(['slice', ['get', 'name'], 2]);
  });

  it('should chain in expressions', () => {
    const expr = literal('important').in(get('tags'));
    expect(expr.build()).toEqual(['in', ['literal', 'important'], ['get', 'tags']]);
  });

  it('should create complex chained lookup expressions', () => {
    const expr = get('fullName').slice(0, get('fullName').length().divide(2));
    expect(expr.build()).toEqual(['slice', ['get', 'fullName'], 0, ['/', ['length', ['get', 'fullName']], 2]]);
  });

  it('should create conditional expressions with lookup operations', () => {
    const expr = when(get('tags').length().gt(0)).then(get('tags').at(0)).else('default');
    expect(expr.build()).toEqual([
      'case',
      ['>', ['length', ['get', 'tags']], 0],
      ['at', 0, ['get', 'tags']],
      'default',
    ]);
  });

  it('should chain indexOf expressions', () => {
    const expr = get('tags').indexOf('important');
    expect(expr.build()).toEqual(['index-of', 'important', ['get', 'tags']]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should chain indexOf expressions with fromIndex', () => {
    const expr = get('tags').indexOf('important', 1);
    expect(expr.build()).toEqual(['index-of', 'important', ['get', 'tags'], 1]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should chain indexOf expressions with expression fromIndex', () => {
    const expr = get('tags').indexOf(get('searchTerm'), get('startIndex'));
    expect(expr.build()).toEqual(['index-of', ['get', 'searchTerm'], ['get', 'tags'], ['get', 'startIndex']]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create globalState expressions', () => {
    const expr = globalState('theme');
    expect(expr.build()).toEqual(['global-state', 'theme']);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create globalState expressions with different property names', () => {
    const expr1 = globalState('color');
    const expr2 = globalState('size');
    const expr3 = globalState('enabled');
    expect(expr1.build()).toEqual(['global-state', 'color']);
    expect(expr2.build()).toEqual(['global-state', 'size']);
    expect(expr3.build()).toEqual(['global-state', 'enabled']);
    expect(globalThis.testUtils.validateExpression(expr1.build())).toBe(true);
    expect(globalThis.testUtils.validateExpression(expr2.build())).toBe(true);
    expect(globalThis.testUtils.validateExpression(expr3.build())).toBe(true);
  });
});

describe('Expression Builder - Advanced Type Expressions', () => {
  it('should create collator expressions with no options', () => {
    const expr = collator();
    expect(expr.build()).toEqual(['collator']);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create collator expressions with case-sensitive option', () => {
    const expr = collator({ 'case-sensitive': true });
    expect(expr.build()).toEqual(['collator', { 'case-sensitive': true }]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create collator expressions with diacritic-sensitive option', () => {
    const expr = collator({ 'diacritic-sensitive': false });
    expect(expr.build()).toEqual(['collator', { 'diacritic-sensitive': false }]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create collator expressions with locale option', () => {
    const expr = collator({ locale: 'en-US' });
    expect(expr.build()).toEqual(['collator', { locale: 'en-US' }]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create collator expressions with all options', () => {
    const expr = collator({ 'case-sensitive': true, 'diacritic-sensitive': false, locale: 'fr-FR' });
    expect(expr.build()).toEqual([
      'collator',
      { 'case-sensitive': true, 'diacritic-sensitive': false, locale: 'fr-FR' },
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create collator expressions with expression options', () => {
    const expr = collator({ 'case-sensitive': get('caseSensitive'), locale: get('userLocale') });
    expect(expr.build()).toEqual([
      'collator',
      { 'case-sensitive': ['get', 'caseSensitive'], locale: ['get', 'userLocale'] },
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should chain image expressions', () => {
    const expr = get('iconName').image();
    expect(expr.build()).toEqual(['image', ['get', 'iconName']]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should chain numberFormat expressions', () => {
    const expr = get('population').numberFormat({ locale: 'en-US' });
    expect(expr.build()).toEqual(['number-format', ['get', 'population'], { locale: 'en-US' }]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should chain numberFormat expressions with currency', () => {
    const expr = get('price').numberFormat({ locale: 'en-US', currency: 'USD' });
    expect(expr.build()).toEqual(['number-format', ['get', 'price'], { locale: 'en-US', currency: 'USD' }]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should chain numberFormat expressions with fraction digits', () => {
    const expr = literal(123.456789).numberFormat({ 'min-fraction-digits': 2, 'max-fraction-digits': 4 });
    expect(expr.build()).toEqual([
      'number-format',
      ['literal', 123.456789],
      { 'min-fraction-digits': 2, 'max-fraction-digits': 4 },
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create format expressions with simple strings', () => {
    const expr = format('Hello', ' ', 'World');
    expect(expr.build()).toEqual(['format', 'Hello', ' ', 'World']);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create format expressions with expressions', () => {
    const expr = format(get('greeting'), ' ', get('name'));
    expect(expr.build()).toEqual(['format', ['get', 'greeting'], ' ', ['get', 'name']]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create format expressions with formatted sections', () => {
    const expr = format('Price: ', { 'text-color': '#ff0000', 'font-scale': 1.2 });
    expect(expr.build()).toEqual(['format', 'Price: ', { 'text-color': '#ff0000', 'font-scale': 1.2 }]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create format expressions with complex formatting', () => {
    const expr = format('Area: ', get('area').numberFormat({ locale: 'en-US' }), ' sq km', {
      'text-color': '#0066cc',
      'font-scale': 0.8,
      'vertical-align': 'bottom',
    });
    expect(expr.build()).toEqual([
      'format',
      'Area: ',
      ['number-format', ['get', 'area'], { locale: 'en-US' }],
      ' sq km',
      { 'text-color': '#0066cc', 'font-scale': 0.8, 'vertical-align': 'bottom' },
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create format expressions with text-font option', () => {
    const expr = format('Warning: ', { 'text-color': '#ff6600', 'text-font': ['literal', ['Arial Bold']] });
    expect(expr.build()).toEqual([
      'format',
      'Warning: ',
      { 'text-color': '#ff6600', 'text-font': ['literal', ['Arial Bold']] },
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create is-supported-script expressions', () => {
    const expr = literal('Hello').isSupportedScript();
    expect(expr.build()).toEqual(['is-supported-script', ['literal', 'Hello']]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);

    // Edge case: Expression input
    const dynamic = get('text').isSupportedScript();
    expect(dynamic.build()).toEqual(['is-supported-script', ['get', 'text']]);
    expect(globalThis.testUtils.validateExpression(dynamic.build())).toBe(true);
  });

  it('should create resolved-locale expressions', () => {
    const expr = collator({ locale: 'en' }).resolvedLocale();
    expect(expr.build()).toEqual(['resolved-locale', ['collator', { locale: 'en' }]]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);

    // Edge case: Complex collator
    const complex = collator({ 'case-sensitive': true, locale: get('userLocale') }).resolvedLocale();
    expect(complex.build()).toEqual([
      'resolved-locale',
      ['collator', { 'case-sensitive': true, locale: ['get', 'userLocale'] }],
    ]);
    expect(globalThis.testUtils.validateExpression(complex.build())).toBe(true);
  });
});

describe('Expression Builder - Variable Binding Expressions', () => {
  it('should create var expressions', () => {
    const expr = $var('myVariable');
    expect(expr.build()).toEqual(['var', 'myVariable']);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create let expressions with single binding', () => {
    const expr = $let({ population: get('population') }).in(get('area'));
    expect(expr.build()).toEqual(['let', 'population', ['get', 'population'], ['get', 'area']]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create let expressions with multiple bindings', () => {
    const expr = $let({
      population: get('population'),
      area: get('area'),
      density: get('population').divide(get('area')),
    }).in($var('density'));
    expect(expr.build()).toEqual([
      'let',
      'population',
      ['get', 'population'],
      'area',
      ['get', 'area'],
      'density',
      ['/', ['get', 'population'], ['get', 'area']],
      ['var', 'density'],
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create let expressions with literal values', () => {
    const expr = $let({ baseSize: 10, multiplier: 2 }).in($var('baseSize').multiply($var('multiplier')));
    expect(expr.build()).toEqual([
      'let',
      'baseSize',
      10,
      'multiplier',
      2,
      ['*', ['var', 'baseSize'], ['var', 'multiplier']],
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should create complex let expressions with calculations', () => {
    const expr = $let({
      pop: get('population'),
      areaKm2: get('area').multiply(0.000001), // Convert to km²
      density: get('population').divide(get('area').multiply(0.000001)),
    }).in(interpolate(['linear'], $var('density'), 0, '#f7fbff', 100, '#08306b'));
    expect(expr.build()).toEqual([
      'let',
      'pop',
      ['get', 'population'],
      'areaKm2',
      ['*', ['get', 'area'], 0.000001],
      'density',
      ['/', ['get', 'population'], ['*', ['get', 'area'], 0.000001]],
      ['interpolate', ['linear'], ['var', 'density'], 0, '#f7fbff', 100, '#08306b'],
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should handle let expressions with nested expressions', () => {
    const expr = $let({ category: get('type'), isResidential: get('type').eq('residential') }).in(
      when($var('isResidential')).then('#ffeb3b').else('#64748b'),
    );
    expect(expr.build()).toEqual([
      'let',
      'category',
      ['get', 'type'],
      'isResidential',
      ['==', ['get', 'type'], 'residential'],
      ['case', ['var', 'isResidential'], '#ffeb3b', '#64748b'],
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should support functional syntax for let expressions', () => {
    const expr = $let({ population: get('population'), area: get('area') }, ({ population, area }) =>
      $var({ density: population.divide(area) }),
    );
    expect(expr.build()).toEqual([
      'let',
      'population',
      ['get', 'population'],
      'area',
      ['get', 'area'],
      'density',
      ['/', ['get', 'population'], ['get', 'area']],
      ['var', 'density'],
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should support functional syntax with multiple computed bindings', () => {
    const expr = $let({ pop: get('population'), area: get('area') }, ({ pop, area }) =>
      $var({ density: pop.divide(area), scaledDensity: pop.divide(area).multiply(100) }),
    );
    expect(expr.build()).toEqual([
      'let',
      'pop',
      ['get', 'population'],
      'area',
      ['get', 'area'],
      'density',
      ['/', ['get', 'population'], ['get', 'area']],
      'scaledDensity',
      ['*', ['/', ['get', 'population'], ['get', 'area']], 100],
      ['var', 'scaledDensity'],
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should enforce VarBindings type safety - users must use $var', () => {
    // This would cause a TypeScript error if uncommented:
    // $let({ pop: get('population') }, ({ pop }) => ({
    //   density: pop.multiply(2)  // Error: plain object not assignable to VarBindings
    // }));

    // Only this works:
    const expr = $let({ pop: get('population') }, ({ pop }) => $var({ pop2: pop.multiply(2) }));
    expect(expr.build()).toEqual([
      'let',
      'pop',
      ['get', 'population'],
      'pop2',
      ['*', ['get', 'population'], 2],
      ['var', 'pop2'],
    ]);
    expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
  });

  it('should demonstrate overloaded $var - variable reference vs variable binding', () => {
    // $var(string) - reference a variable
    const varRef = $var('density');
    expect(varRef.build()).toEqual(['var', 'density']);

    // $var(object) - create variable bindings (used in varFn)
    const bindings = $var({ density: get('population').divide(get('area')) });
    expect(bindings.__brand).toBe('VarBindings');
    expect(bindings.bindings).toEqual({ density: get('population').divide(get('area')) });

    // Combined usage in $let
    const expr = $let({ pop: get('population'), area: get('area') }, ({ pop, area }) =>
      $var({ density: pop.divide(area) }),
    );
    expect(expr.build()).toEqual([
      'let',
      'pop',
      ['get', 'population'],
      'area',
      ['get', 'area'],
      'density',
      ['/', ['get', 'population'], ['get', 'area']],
      ['var', 'density'],
    ]);
  });

  describe('Spatial Operations', () => {
    describe('distance', () => {
      it('should create distance expression with coordinate array', () => {
        const point: GeoJSON.Point = { type: 'Point', coordinates: [-74.5, 40] };
        const expr = get('feature').distance(point);
        expect(expr.build()).toEqual(['distance', point]);
        expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
      });

      it('should create distance expression with expression point', () => {
        const pointExpr = literal({ type: 'Point', coordinates: [-74.5, 40] });
        const expr = get('feature').distance(pointExpr);
        expect(expr.build()).toEqual(['distance', ['literal', { type: 'Point', coordinates: [-74.5, 40] }]]);
        expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
      });
    });

    describe('within', () => {
      it('should create within expression with GeoJSON polygon', () => {
        const polygon: GeoJSON.Polygon = {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        };
        const expr = get('feature').within(polygon);
        expect(expr.build()).toEqual(['within', polygon]);
        expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
      });

      it('should create within expression with expression polygon', () => {
        const polygonExpr = literal({
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        });
        const expr = get('feature').within(polygonExpr);
        expect(expr.build()).toEqual([
          'within',
          [
            'literal',
            {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1],
                  [0, 0],
                ],
              ],
            },
          ],
        ]);
        expect(globalThis.testUtils.validateExpression(expr.build())).toBe(true);
      });
    });
  });
});
