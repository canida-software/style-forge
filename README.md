# Style Forge

A type-safe MapLibre style expression builder for TypeScript.

## Installation

```bash
npm install style-forge
```

Or from a git repository:

```bash
npm install git+https://github.com/canida/style-forge.git
```

## Peer Dependencies

This library requires `@maplibre/maplibre-gl-style-spec` as a peer dependency:

```bash
npm install @maplibre/maplibre-gl-style-spec
```

## Usage

```typescript
import { match, get, interpolate, when, zoom, Layer } from 'style-forge';

// Data-driven color based on feature properties
const colorByCategory = match(get('category'))
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

// Complex conditional with large color palettes
const advancedLayer = new Layer('fill', 'buildings-advanced', 'buildings-source', 'buildings')
  .fillColor(
    when(has('id'))
      .then(
        match(get('id').toNumber().mod(256))
          .branches({
            0: '#ff0000', 1: '#00ff00', 2: '#0000ff', 3: '#ffff00',
            4: '#ff00ff', 5: '#00ffff', 6: '#800080', 7: '#ffa500',
            8: '#a52a2a', 9: '#808080', 10: '#000080', 11: '#008000',
            // ...
          })
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

**Basic Expressions:**
- `get(property)` - Get a feature property
- `zoom()` - Get current zoom level
- `literal(value)` - Create a literal value

**Type System Expressions:**
- `toColor(value)` - Convert value to color type
- `string(value)`, `number(value)`, `boolean(value)`, `array(value)`, `object(value)` - Type assertions
- `typeOf(value)` - Get the type of a value as a string
- `coalesce(...values)` - Return first non-null value

**Conditional & Logic:**
- `when(condition).then(value).else(value)` - Conditional expressions
- `match(input).branches({...}).fallback(value)` - Match expressions

**Mathematical:**
- `add(...values)`, `subtract(a, b)`, `multiply(...values)`, `divide(a, b)` - Arithmetic
- `mod(a, b)`, `pow(base, exponent)` - Modulo and power

**Interpolation:**
- `interpolate(['linear'], input, ...stops)` - Interpolation functions
- `step(input, min, ...stops)` - Step functions

### Layer Builder

- `new Layer(type, id?, source?, sourceLayer?)` - Create a layer
- `.fillColor(value)`, `.circleRadius(value)`, etc. - Set style properties
- `.filter(expression)` - Add layer filter
- `.visibility('visible' | 'none')` - Control layer visibility
- `.minZoom(value)`, `.maxZoom(value)` - Set zoom constraints

## Building

```bash
# Build the library
npm run build:lib

# Build everything (library + demo)
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
