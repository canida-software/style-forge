# Style Forge

A type-safe MapLibre style expression builder for TypeScript.

## Installation

```bash
npm install git+https://github.com/canida-software/style-forge.git#dist
```

Note: This installs the pre-built version from the `dist` branch. Ensure you have the peer dependency installed:

```bash
npm install @maplibre/maplibre-gl-style-spec
```


## API Philosophy

**🎯 Fluent API First** – The fluent, chainable API is the recommended way to use Style Forge.

```typescript
// ✅ Recommended: Fluent API
const colorByCategory = get('category').match()
  .branches({
    residential: '#ffeb3b',
    commercial: '#2196f3',
    industrial: '#f44336'
  })
  .fallback('#9e9e9e');
```

## Usage

```typescript
import { get, has, match, interpolate, when, zoom, Layer, $let, $var } from 'style-forge';

// Data-driven color based on feature properties - fluent API
const colorByCategory = get('category').match()
  .branches({
    residential: '#ffeb3b',
    commercial: '#2196f3',
    industrial: '#f44336',
    recreational: '#4caf50'
  })
  .fallback('#9e9e9e');

// Zoom-based opacity with smooth interpolation
const opacityByZoom = interpolate(
  ['linear'],
  zoom(),
  0, 0.1,   // At zoom 0: 10% opacity
  10, 0.5,  // At zoom 10: 50% opacity
  20, 1.0   // At zoom 20: 100% opacity
);

// Conditional sizing based on magnitude
const sizeByMagnitude = when(get('magnitude').gte(5))
  .then(
    interpolate(['exponential', 2], get('magnitude'), 5, 10, 10, 50)
  )
  .else(5);

// Complex data-driven layer
const earthquakeLayer = new Layer('circle', 'earthquakes', 'earthquake-source')
  .circleColor(colorByCategory.build())
  .circleRadius(sizeByMagnitude.build())
  .circleOpacity(opacityByZoom.build())
  .visibility('visible');

const smartColor = match(get('type'))
  .branches({
    house: '#ffeb3b',
    apartment: '#2196f3',
    office: '#f44336'
  })
  .fallback('#9e9e9e');

const adaptiveSize = when(zoom().gt(12))
  .then(get('area').multiply(0.01).add(5))
  .else(8);

const buildingLayer = new Layer('fill', 'buildings', 'map-data', 'buildings')
  .fillColor(smartColor.build())
  .fillOpacity(interpolate(['linear'], zoom(), 10, 0.3, 18, 0.9).build())
  .visibility('visible');

// Derived values with scoped variables using $let / $var
const scaledDensity = $let(
  { pop: get('population'), area: get('area') },
  ({ pop, area }) => $var({ scaledDensity: pop.divide(area).multiply(100) }),
);


// Complex conditional with large color palettes
const palette = [
  '#ff0000',
  '#00ff00',
  '#0000ff',
  // ...
];
const advancedLayer = new Layer('fill', 'buildings-advanced', 'buildings-source', 'buildings')
  .fillColor(
    when(has('id'))
      .then(
        match(get('id').toNumber().mod(palette.length))
          .branches(
            Object.fromEntries(
              palette.map((color, index) => [index, color] as const),
            ),
          )
          .fallback('#64748b')
      )
      .else('#64748b')
      .build()
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

- `new Layer(type, id?, source?, sourceLayer?)` - Create a layer
- `.fillColor(value)`, `.circleRadius(value)`, etc. - Set style properties
- `.filter(expression)` - Add layer filter
- `.visibility('visible' | 'none')` - Control layer visibility
- `.minZoom(value)`, `.maxZoom(value)` - Set zoom constraints

## Building

```bash
# Build the library
npm run build
```

## Development

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format

# Start dev server
npm run dev
```
