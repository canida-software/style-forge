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
  eq,
  gt,
  gte,
  and,
  not,
  toNumber,
  toString,
  concat,
  upcase,
  downcase,
} from '../lib/index';

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
  });

  it('should create exponential interpolation expressions', () => {
    const expr = interpolate(['exponential', 2], get('magnitude'), 0, 5, 10, 50);
    expect(expr.build()).toEqual(['interpolate', ['exponential', 2], ['get', 'magnitude'], 0, 5, 10, 50]);
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
