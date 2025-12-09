import { describe, it, expect } from 'vitest';
import { Layer, match, get, interpolate, zoom, when, has } from '../lib/index';

describe('Layer Builder - Basic Layer Creation', () => {
  it('should create a fill layer with basic properties', () => {
    const layer = new Layer('fill', 'buildings-fill', 'buildings-source', 'buildings')
      .fillColor('#ff0000')
      .fillOpacity(0.8)
      .visibility('visible');

    const result = layer.build();
    expect(result.id).toBe('buildings-fill');
    expect(result.type).toBe('fill');
    expect(result.source).toBe('buildings-source');
    expect(result['source-layer']).toBe('buildings');
    expect(result.paint).toEqual({ 'fill-color': '#ff0000', 'fill-opacity': 0.8 });
    expect(result.layout).toEqual({ visibility: 'visible' });
  });

  it('should create a circle layer', () => {
    const layer = new Layer('circle', 'points-circle', 'points-source')
      .circleColor('#ff0000')
      .circleRadius(5)
      .visibility('visible');

    const result = layer.build();
    expect(result.type).toBe('circle');
    expect(result.id).toBe('points-circle');
    expect(result.source).toBe('points-source');
    expect(result.paint).toEqual({ 'circle-color': '#ff0000', 'circle-radius': 5 });
  });

  it('should create a line layer', () => {
    const layer = new Layer('line', 'roads-line', 'roads-source', 'roads')
      .lineColor('#666666')
      .lineWidth(2)
      .visibility('visible');

    const result = layer.build();
    expect(result.type).toBe('line');
    expect(result.id).toBe('roads-line');
    expect(result['source-layer']).toBe('roads');
    expect(result.paint).toEqual({ 'line-color': '#666666', 'line-width': 2 });
  });
});

describe('Layer Builder - Data-Driven Properties', () => {
  it('should create fill layer with data-driven color', () => {
    const colorByCategory = match(get('category'))
      .branches({ residential: '#ffeb3b', commercial: '#2196f3', industrial: '#f44336' })
      .fallback('#9e9e9e');

    const layer = new Layer('fill', 'buildings-fill', 'buildings-source', 'buildings')
      .fillColor(colorByCategory.build())
      .visibility('visible');

    const result = layer.build();
    expect(result.paint['fill-color']).toEqual([
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

  it('should create circle layer with data-driven radius', () => {
    const radiusByMagnitude = when(get('magnitude').gte(5))
      .then(interpolate(['exponential', 2], get('magnitude'), 5, 10, 10, 50))
      .else(5);

    const layer = new Layer('circle', 'earthquakes', 'earthquake-source')
      .circleRadius(radiusByMagnitude.build())
      .circleColor('#ff0000')
      .visibility('visible');

    const result = layer.build();
    expect(result.type).toBe('circle');
    expect(result.id).toBe('earthquakes');
    expect(result.source).toBe('earthquake-source');
    expect(result.paint['circle-radius'][0]).toBe('case');
    expect(result.paint['circle-color']).toBe('#ff0000');
  });

  it('should create line layer with zoom-based width', () => {
    const widthByZoom = interpolate(['linear'], zoom(), 0, 1, 20, 5);

    const layer = new Layer('line', 'roads-line', 'roads-source', 'roads')
      .lineWidth(widthByZoom.build())
      .lineColor('#666666')
      .visibility('visible');

    const result = layer.build();
    expect(result.paint['line-width']).toEqual(['interpolate', ['linear'], ['zoom'], 0, 1, 20, 5]);
  });
});

describe('Layer Builder - Complex Layer Configurations', () => {
  it('should create earthquake visualization layer', () => {
    const colorByMagnitude = when(get('magnitude').gte(7))
      .then('#ff0000')
      .when(get('magnitude').gte(5))
      .then('#ff8800')
      .when(get('magnitude').gte(3))
      .then('#ffff00')
      .else('#00ff00');

    const sizeByMagnitude = when(get('magnitude').gte(5))
      .then(interpolate(['exponential', 2], get('magnitude'), 5, 10, 10, 50))
      .else(5);

    const layer = new Layer('circle', 'earthquakes', 'earthquake-source')
      .circleColor(colorByMagnitude.build())
      .circleRadius(sizeByMagnitude.build())
      .visibility('visible');

    const result = layer.build();
    expect(result.type).toBe('circle');
    expect(result.id).toBe('earthquakes');

    // Verify color expression structure
    const colorExpr = result.paint['circle-color'];
    expect(colorExpr[0]).toBe('case');
    expect(colorExpr.length).toBeGreaterThan(5); // Multiple conditions

    // Verify radius expression structure
    const radiusExpr = result.paint['circle-radius'];
    expect(radiusExpr[0]).toBe('case');
  });

  it('should create building layer with complex conditional coloring', () => {
    const advancedColorPalette = when(has('id'))
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
            8: '#a52a2a',
            9: '#808080',
            10: '#000080',
            11: '#008000',
          })
          .fallback('#64748b'),
      )
      .else('#64748b');

    const adaptiveOpacity = interpolate(['linear'], zoom(), 10, 0.3, 18, 0.9);

    const layer = new Layer('fill', 'buildings-advanced', 'buildings-source', 'buildings')
      .fillColor(advancedColorPalette.build())
      .fillOpacity(adaptiveOpacity.build())
      .visibility('visible')
      .minZoom(8)
      .maxZoom(20);

    const result = layer.build();
    expect(result.type).toBe('fill');
    expect(result.id).toBe('buildings-advanced');
    expect(result.minzoom).toBe(8);
    expect(result.maxzoom).toBe(20);

    // Verify complex color expression
    const colorExpr = result.paint['fill-color'];
    expect(colorExpr[0]).toBe('case');
    expect(colorExpr[1]).toEqual(['has', 'id']); // First condition
    expect(Array.isArray(colorExpr[2])).toBe(true); // Nested match expression
    expect(colorExpr[2][0]).toBe('match'); // Match inside case

    // Verify opacity interpolation
    const opacityExpr = result.paint['fill-opacity'];
    expect(opacityExpr[0]).toBe('interpolate');
  });
});

describe('Layer Builder - Layer Properties and Filters', () => {
  it('should handle zoom constraints', () => {
    const layer = new Layer('fill', 'test-layer', 'test-source', 'test-layer')
      .minZoom(5)
      .maxZoom(15)
      .visibility('visible');

    const result = layer.build();
    expect(result.minzoom).toBe(5);
    expect(result.maxzoom).toBe(15);
  });

  it('should handle filters', () => {
    const filterExpr = when(has('id')).then(true).else(false);

    const layer = new Layer('fill', 'filtered-layer', 'data-source', 'layer')
      .fillColor('#ff0000')
      .filter(filterExpr.build())
      .visibility('visible');

    const result = layer.build();
    expect(result.filter).toEqual(['case', ['has', 'id'], true, false]);
  });

  it('should create symbol layer with text properties', () => {
    const layer = new Layer('symbol', 'labels-symbol', 'buildings-source', 'buildings')
      .textField(['get', 'name'])
      .textSize(12)
      .visibility('visible')
      .minZoom(10);

    const result = layer.build();
    expect(result.type).toBe('symbol');
    expect(result.layout).toEqual({ 'text-field': ['get', 'name'], 'text-size': 12, visibility: 'visible' });
    expect(result.minzoom).toBe(10);
  });
});

describe('Layer Builder - Layer Validation', () => {
  it('should create valid MapLibre layer objects', () => {
    const layer = new Layer('fill', 'test-layer', 'test-source', 'test-layer')
      .fillColor('#ff0000')
      .visibility('visible');

    const result = layer.build();

    // Basic layer structure validation
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('source');
    expect(result.type).toBe('fill');
    expect(typeof result.id).toBe('string');
    expect(typeof result.source).toBe('string');
  });

  it('should handle layers without source-layer', () => {
    const layer = new Layer('circle', 'points', 'points-source').circleColor('#ff0000').circleRadius(5);

    const result = layer.build();
    expect(result).not.toHaveProperty('source-layer');
    expect(result.source).toBe('points-source');
  });
});
