# Style Forge

A type-safe MapLibre style expression builder for TypeScript.

## Installation

```bash
npm install git+https://github.com/canida-software/style-forge.git#dist
```

Ensure the peer dependency is installed:

```bash
npm install @maplibre/maplibre-gl-style-spec
```

## API Philosophy

**🎯 Fluent API First** – The fluent, chainable API is the recommended way to use Style Forge. Static helpers are kept for compatibility, but new code should prefer the fluent style.

```typescript
// MapLibre JSON
const highlightColorJson = [
  'case',
  ['has', 'isSelected'],
  '#f97316',
  '#9ca3af',
];

// Style Forge
const highlightColor = when(has('isSelected'))
  .then('#f97316')
  .else('#9ca3af');
```

## Usage

```typescript
import { get, has, match, interpolate, when, zoom, Layer, $let, $var } from 'style-forge';

// ---------------------------------------------------------------------------
// Example 1: Category-based color
// ---------------------------------------------------------------------------

// MapLibre JSON
const colorByCategoryJson = [
  'match',
  ['get', 'category'],
  'residential',
  '#ffeb3b',
  'commercial',
  '#2196f3',
  'industrial',
  '#f44336',
  'recreational',
  '#4caf50',
  '#9e9e9e',
];

// Style Forge
const colorByCategory = get('category')
  .match({
    residential: '#ffeb3b',
    commercial: '#2196f3',
    industrial: '#f44336',
    recreational: '#4caf50',
  })
  .fallback('#9e9e9e');

// ---------------------------------------------------------------------------
// Example 2: Zoom-based opacity
// ---------------------------------------------------------------------------

// MapLibre JSON
const opacityByZoomJson = [
  'interpolate',
  ['linear'],
  ['zoom'],
  0,
  0.1,
  10,
  0.5,
  20,
  1.0,
];

// Style Forge
const opacityByZoom = interpolate(['linear'], zoom(), 0, 0.1, 10, 0.5, 20, 1.0);

// ---------------------------------------------------------------------------
// Example 3: Conditional size by magnitude
// ---------------------------------------------------------------------------

// MapLibre JSON
const sizeByMagnitudeJson = [
  'case',
  ['>=', ['get', 'magnitude'], 5],
  ['interpolate', ['exponential', 2], ['get', 'magnitude'], 5, 10, 10, 50],
  5,
];

// Style Forge
const sizeByMagnitude = when(get('magnitude').gte(5))
  .then(interpolate(['exponential', 2], get('magnitude'), 5, 10, 10, 50))
  .else(5);

// ---------------------------------------------------------------------------
// Example 4: Layer with data-driven color and size
// ---------------------------------------------------------------------------

// MapLibre JSON
const earthquakeLayerJson = {
  id: 'earthquakes',
  type: 'circle',
  source: 'earthquake-source',
  paint: {
    'circle-color': colorByCategoryJson,
    'circle-radius': sizeByMagnitudeJson,
    'circle-opacity': opacityByZoomJson,
  },
};

// Style Forge
const earthquakeLayer = new Layer('circle', 'earthquakes', 'earthquake-source')
  .circleColor(colorByCategory.forge())
  .circleRadius(sizeByMagnitude.forge())
  .circleOpacity(opacityByZoom.forge())
  .visibility('visible');

// ---------------------------------------------------------------------------
// Example 5: Derived value with let / var
// ---------------------------------------------------------------------------

// MapLibre JSON
const scaledDensityJson = [
  'let',
  'pop',
  ['get', 'population'],
  'area',
  ['get', 'area'],
  'scaledDensity',
  ['*', ['/', ['get', 'population'], ['get', 'area']], 100],
  ['var', 'scaledDensity'],
];

// Style Forge
const scaledDensity = $let(
  { pop: get('population'), area: get('area') },
  ({ pop, area }) => $var({ scaledDensity: pop.divide(area).multiply(100) }),
);

// ---------------------------------------------------------------------------
// Example 6: Palette-based color
// ---------------------------------------------------------------------------

const palette = ['#ff0000', '#00ff00', '#0000ff'];

// MapLibre JSON (schematic)
const paletteColorJson = [
  'case',
  ['has', 'id'],
  [
    'match',
    ['%', ['to-number', ['get', 'id']], palette.length],
    0,
    palette[0],
    1,
    palette[1],
    2,
    palette[2],
    // ...
    '#64748b',
  ],
  '#64748b',
];

// Style Forge
const advancedLayer = new Layer('fill', 'buildings-advanced', 'buildings-source', 'buildings')
  .fillColor(
    when(has('id'))
      .then(
        match(get('id').toNumber().mod(palette.length))
          .branches(Object.fromEntries(palette.map((color, index) => [index, color] as const)))
          .fallback('#64748b'),
      )
      .else('#64748b')
      .forge(),
  )
  .fillOpacity(0.8)
  .visibility('visible');
```

## API

### Fluent Expression API

**Basic Expressions**
- `get(property)`, `has(property)` – feature access and existence.
- `zoom()` – current zoom level.
- `literal(value)` – literal values.
- `globalState(key)` – read from global state.
- `elevation()` – terrain elevation expression.

**Conditionals & Match**
- `when(condition).then(value).else(value)` – fluent conditional builder.
- `conditional(condition)` – alias for `when`.
- `match(input).branches({...}).fallback(value)` – match expressions with branches.

**Variable Bindings**
- `$let(bindings, varFn?)` / `Expression.let(...)` – scoped variable bindings using MapLibre `let`.
- `$var(name)` / `Expression.var(name)` – reference a bound variable.

**Mathematics & Constants**
- Static helpers: `add(...)`, `subtract(a,b)`, `multiply(...)`, `divide(a,b)`, `mod(a,b)`, `pow(a,b)`.
- Fluent math: `expr.add(...)`, `expr.subtract(...)`, `expr.multiply(...)`, `expr.divide(...)`, `expr.mod(...)`, `expr.pow(...)`.
- Extra fluent math: `expr.sqrt()`, `expr.log10()`.
- Constants: `pi()`, `e()`, `ln2()`.

**Comparison & Logic**
- Comparisons: `eq(a,b)`, `neq(a,b)`, `gt(a,b)`, `gte(a,b)`, `lt(a,b)`, `lte(a,b)` or fluent `expr.eq(...)`, etc.
- Logic: `and(...)`, `or(...)`, `not(expr)` and fluent `expr.and(...)`, `expr.or(...)`.

**Type Conversion & Assertions**
- Conversions: `toNumber(value)`, `toString(value)`, `toBoolean(value)`, `toColor(value)` or fluent `expr.toNumber()`, etc.
- Assertions: `string(value)`, `number(value)`, `boolean(value)`, `array(value)`, `object(value)` or fluent `expr.string()`, `expr.array('string')`, etc.
- Type checks: `typeOf(value)` / fluent `expr.typeof()`.
- Null handling: `coalesce(...values)` / fluent `expr.coalesce(...)`.

**Advanced Type & Formatting**
- `collator(options?)` – locale-aware string comparison configuration.
- `format(...parts)` – rich text formatting.
- Fluent helpers: `expr.image()` for sprite references, `expr.numberFormat(options)` for localized numbers, `expr.resolvedLocale()`, `expr.isSupportedScript()`.

**Strings & Lookups**
- String helpers: `concat(...values)`, `upcase(value)`, `downcase(value)` or fluent `expr.concat(...)`, `expr.upcase()`, `expr.downcase()`.
- Lookups (fluent only): `expr.length()`, `expr.at(index)`, `expr.slice(start, end?)`, `expr.in(collection)`, `expr.indexOf(item, fromIndex?)`.

**Interpolation & Stepping**
- Static interpolation: `interpolate(interpolation, input, ...stops)` – e.g. `interpolate(['linear'], zoom(), 0, 0.1, 20, 1.0)`.
- Fluent interpolation: `expr.interpolate(interpolation, ...stops)`, plus color-space variants `expr.interpolateHcl(...)`, `expr.interpolateLab(...)`.
- Static steps: `step(input, min, ...stops)`.
- Fluent steps: `expr.step(min, ...stops)`.

### Layer Builder

- `new Layer(type, id?, source?, sourceLayer?)` – create a layer.
- `.fillColor(value)`, `.circleRadius(value)`, etc. – set paint properties.
- `.filter(expression)` – add layer filter.
- `.visibility('visible' | 'none')` – control layer visibility.
- `.minZoom(value)`, `.maxZoom(value)` – set zoom constraints.

## Building

```bash
npm run build
```

## Development

```bash
npm install
npm run lint
npm run format
npm run dev
```
