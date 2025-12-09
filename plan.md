# MapLibre Style Spec Expression Builder - Full Expressiveness Plan

## Overview

This plan outlines the implementation of missing expressions to achieve **100% coverage** of the [MapLibre Style Spec expressions](https://maplibre.org/maplibre-style-spec/expressions/) with **fluent API only**. Currently at ~60% coverage, this plan will bring the expression builder to full compliance while eliminating the static API entirely for better developer experience.

## References & Resources

### Official Documentation
- **[MapLibre Style Spec Expressions](https://maplibre.org/maplibre-style-spec/expressions/)** - Complete reference for all expression operators
- **[MapLibre GL JS Source Code](/.better-coding-agents/resources/maplibre-gl-js)** - Reference implementation and types

### Type Definitions
- **[MapLibre Style Spec Types](node_modules/@maplibre/maplibre-gl-style-spec/dist/index.d.ts)** - TypeScript definitions for expressions and style properties
- **[ExpressionSpecification](node_modules/@maplibre/maplibre-gl-style-spec/dist/index.d.ts)** - Core expression type definitions

### Implementation Guidelines
- All expressions must match the [official spec](https://maplibre.org/maplibre-style-spec/expressions/) exactly
- TypeScript types should align with [maplibre-gl-style-spec](node_modules/@maplibre/maplibre-gl-style-spec/dist/index.d.ts)
- Reference [MapLibre GL JS](/.better-coding-agents/resources/maplibre-gl-js) for implementation patterns

## Current Status

**✅ Implemented (60 expressions):**
- Core data access: `get`, `has`, `zoom`
- Mathematical operations: `+`, `-`, `*`, `/`, `%`, `^`, `ln`, `sin`, `cos`, `tan`, `min`, `max`, etc.
- Comparisons: `==`, `!=`, `>`, `<`, `>=`, `<=`
- Logical: `all`, `any`, `!`
- Type conversion: `to-number`, `to-string`, `to-boolean`
- String operations: `concat`, `upcase`, `downcase`
- Interpolation: `interpolate`, `step`
- Fluent APIs: `when`/`then`/`else`, `match`/`branches`/`fallback`

**🚧 Partially Implemented (5 expressions):**
- `case` (fluent API exists, traditional missing)
- `length` (array-only, needs string support)

**❌ Missing (35+ expressions):**
- Type assertions, lookup operations, advanced math, variable binding, etc.

## Implementation Strategy

### Phase 1: High-Priority Expressions (Week 1-2)
**Goal:** Cover 80% of real-world usage patterns

#### 1.1 Type System Expressions
**References:** [Type System](https://maplibre.org/maplibre-style-spec/expressions/#type-system), [Type Expressions](https://maplibre.org/maplibre-style-spec/expressions/#types)
- [ ] `coalesce` - [Decision: coalesce](https://maplibre.org/maplibre-style-spec/expressions/#coalesce)
- [ ] `toColor` - [Types: to-color](https://maplibre.org/maplibre-style-spec/expressions/#to-color)
- [ ] Type assertions: `string()`, `number()`, `boolean()`, `array()`, `object()` - [Types section](https://maplibre.org/maplibre-style-spec/expressions/#types)
- [ ] `typeof` - [Types: typeof](https://maplibre.org/maplibre-style-spec/expressions/#typeof)

#### 1.2 Lookup Expressions
**References:** [Lookup](https://maplibre.org/maplibre-style-spec/expressions/#lookup)
- [ ] `length` - [Lookup: length](https://maplibre.org/maplibre-style-spec/expressions/#length)
- [ ] `in` - [Lookup: in](https://maplibre.org/maplibre-style-spec/expressions/#in)
- [ ] `slice` - [Lookup: slice](https://maplibre.org/maplibre-style-spec/expressions/#slice)
- [ ] `at` - [Lookup: at](https://maplibre.org/maplibre-style-spec/expressions/#at)

### Phase 2: Medium-Priority Expressions (Week 3-4)
**Goal:** Cover 95% of usage patterns

#### 2.1 Advanced Math
**References:** [Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
- [ ] `sqrt`, `log10` - [Math: sqrt](https://maplibre.org/maplibre-style-spec/expressions/#sqrt), [Math: log10](https://maplibre.org/maplibre-style-spec/expressions/#log10)
- [ ] `ln2`, `pi`, `e` - [Math: ln2](https://maplibre.org/maplibre-style-spec/expressions/#ln2), [Math: pi](https://maplibre.org/maplibre-style-spec/expressions/#pi), [Math: e](https://maplibre.org/maplibre-style-spec/expressions/#e)

#### 2.2 Lookup Operations
**References:** [Lookup](https://maplibre.org/maplibre-style-spec/expressions/#lookup)
- [ ] `indexOf` - [Lookup: index-of](https://maplibre.org/maplibre-style-spec/expressions/#index-of)
- [ ] `globalState` - [Lookup: global-state](https://maplibre.org/maplibre-style-spec/expressions/#global-state)

#### 2.3 Advanced Types
**References:** [Types](https://maplibre.org/maplibre-style-spec/expressions/#types)
- [ ] `collator` - [Types: collator](https://maplibre.org/maplibre-style-spec/expressions/#collator)
- [ ] `format` - [Types: format](https://maplibre.org/maplibre-style-spec/expressions/#format)
- [ ] `image` - [Types: image](https://maplibre.org/maplibre-style-spec/expressions/#image)
- [ ] `numberFormat` - [Types: number-format](https://maplibre.org/maplibre-style-spec/expressions/#number-format)

### Phase 3: Advanced Features (Week 5-6)
**Goal:** 100% spec compliance

#### 3.1 Variable Binding
**References:** [Variable binding](https://maplibre.org/maplibre-style-spec/expressions/#variable-binding)
- [x] `let`/`var` - [let](https://maplibre.org/maplibre-style-spec/expressions/#let), [var](https://maplibre.org/maplibre-style-spec/expressions/#var) - Variable scoping system (implemented with LetBuilder pattern)

#### 3.2 Spatial Operations
**References:** [Decision](https://maplibre.org/maplibre-style-spec/expressions/#decision), [Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
- [x] `within` - [Decision: within](https://maplibre.org/maplibre-style-spec/expressions/#within) - Geometric containment testing
- [x] `distance` - [Math: distance](https://maplibre.org/maplibre-style-spec/expressions/#distance) - Spatial distance calculations

#### 3.3 Specialized Expressions
**References:** Various sections based on expression type
- [ ] `elevation` - [Color Relief: elevation](https://maplibre.org/maplibre-style-spec/expressions/#elevation) - Terrain elevation data
- [ ] `interpolateHcl`/`interpolateLab` - [Ramps: interpolate-hcl](https://maplibre.org/maplibre-style-spec/expressions/#interpolate-hcl), [Ramps: interpolate-lab](https://maplibre.org/maplibre-style-spec/expressions/#interpolate-lab) - Advanced color interpolation
- [ ] `isSupportedScript` - [String: is-supported-script](https://maplibre.org/maplibre-style-spec/expressions/#is-supported-script) - Text rendering capability checking
- [ ] `resolvedLocale` - [String: resolved-locale](https://maplibre.org/maplibre-style-spec/expressions/#resolved-locale) - Locale resolution for collators

## Implementation Guidelines

### 🎯 **Fluent API Only - No Static API**
**Static API methods will be deprecated and removed. Use fluent API exclusively!**

### 1. Consistent API Design
```typescript
// ✅ ONLY: Fluent API - the sole supported approach
expression.coalesce(value1, value2, value3)  // ["coalesce", expression, value1, value2, value3]
expression.length()                          // ["length", expression]
expression.in(array)                         // ["in", expression, array]

// ❌ REMOVED: Static API - will be deprecated and eliminated
// Expression.coalesce(expression, value1, value2, value3)
// Expression.length(expression)
// Expression.in(expression, array)
```

### 2. Type Safety & TypeScript Integration
- **Expression Types**: Use `ExpressionSpecification` from [maplibre-gl-style-spec](node_modules/@maplibre/maplibre-gl-style-spec/dist/index.d.ts)
- **Return Types**: Reference the [official spec](https://maplibre.org/maplibre-style-spec/expressions/) for correct return types
- **Generic Types**: Leverage TypeScript generics for type-safe expressions
- **Input Validation**: Validate against spec requirements at runtime

### 3. Builder Patterns & Fluent APIs Only
- **Complex Expressions**: Use builder patterns for complex expressions (like `let`/`var`)
- **Fluent Consistency**: Maintain consistent chaining API across all expressions
- **Performance**: Consider memory usage and evaluation performance
- **Reference Implementation**: Study patterns in [MapLibre GL JS](/.better-coding-agents/resources/maplibre-gl-js)
- **No Static Methods**: All functionality accessible through fluent API only

### 4. Error Handling & Validation
- **Runtime Validation**: Check input types against [spec requirements](https://maplibre.org/maplibre-style-spec/expressions/)
- **Clear Errors**: Provide descriptive error messages with spec references
- **Graceful Fallbacks**: Handle invalid expressions according to spec behavior
- **Type Guards**: Use runtime type checking where TypeScript types are insufficient

### 5. Migration Strategy - Static API Removal
- **Phase 1**: Add deprecation warnings to static API methods
- **Phase 2**: Remove static API methods entirely
- **Migration Guide**: Provide clear examples of fluent API equivalents
- **Breaking Change**: Major version bump when static API is removed
- **Documentation**: Update all examples to use fluent API only

## Testing Strategy

### Unit Tests
- Test each expression individually
- Validate generated expression arrays match spec
- Test type safety with invalid inputs

### Integration Tests
- Test complex expression combinations
- Validate against real MapLibre rendering
- Performance benchmarking

### Compatibility Tests
- Cross-browser testing
- Node.js compatibility
- Build tool compatibility

## Architecture Considerations

### 1. Expression Registry
Consider a centralized expression registry for:
- Dynamic expression registration
- Type validation
- Documentation generation

### 2. Performance Optimizations
- Expression caching for frequently used patterns
- Lazy evaluation where beneficial
- Memory usage monitoring

### 3. Extensibility
- Plugin architecture for custom expressions
- Third-party expression support
- Expression composition utilities

## Risk Assessment

### High Risk
- ~~**Variable binding (`let`/`var`)**: Complex scoping rules, potential for bugs~~ - **COMPLETED** ✅
- **Spatial operations (`within`, `distance`)**: Performance implications, GeoJSON handling

### Medium Risk
- **Advanced type assertions**: Complex type checking logic
- **Locale-aware operations**: Internationalization complexity

### Low Risk
- **Mathematical constants**: Simple static expressions
- **Basic lookup operations**: Straightforward implementations

## Success Metrics

### Functional Completeness
- [ ] 100% MapLibre Style Spec expression coverage
- [ ] All expressions validated against official spec
- [ ] Fluent API only (static API deprecated and removed)
- [ ] Migration guide provided for static API users

### Code Quality
- [ ] 100% TypeScript strict mode compliance
- [ ] Comprehensive test coverage (>95%)
- [ ] Zero critical bugs in production use

### Performance
- [ ] No significant performance regression
- [ ] Memory usage within acceptable bounds
- [ ] Bundle size impact minimized

## Timeline

| Phase | Duration | Expressions | Priority |
|-------|----------|-------------|----------|
| Phase 1 | 2 weeks | 12 expressions | High |
| Phase 2 | 2 weeks | 10 expressions | Medium |
| Phase 3 | 2 weeks | 8 expressions | Low |
| Testing & Polish | 1 week | - | High |

**Total: 6 weeks to full compliance**

## Dependencies

### External Documentation & Types
- **[MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/expressions/)** - Authoritative expression reference
- **[MapLibre GL JS](/.better-coding-agents/resources/maplibre-gl-js)** - Reference implementation
- **[Style Spec Types](node_modules/@maplibre/maplibre-gl-style-spec/dist/index.d.ts)** - TypeScript definitions
- Geographic calculation libraries (for `distance`/`within` operations)

### Internal Architecture
- Expression validation system (against [spec types](node_modules/@maplibre/maplibre-gl-style-spec/dist/index.d.ts))
- Type assertion utilities (following [type system](https://maplibre.org/maplibre-style-spec/expressions/#type-system))
- Builder pattern framework (inspired by [MapLibre GL JS patterns](/.better-coding-agents/resources/maplibre-gl-js))

## Maintenance Plan

### Ongoing Compliance
- **Spec Monitoring**: Track updates to [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/expressions/)
- **Type Updates**: Monitor [maplibre-gl-style-spec](node_modules/@maplibre/maplibre-gl-style-spec/dist/index.d.ts) releases
- **Implementation Sync**: Compare against [MapLibre GL JS](/.better-coding-agents/resources/maplibre-gl-js) patterns
- **API Consistency**: Ensure fluent API remains the only supported approach
- Performance regression testing
- Community contribution guidelines

### Future Enhancements
- Custom expression support (extending [expression system](https://maplibre.org/maplibre-style-spec/expressions/))
- Expression optimization passes (following [MapLibre GL JS optimizations](/.better-coding-agents/resources/maplibre-gl-js))
- Visual expression builder (GUI) for [style spec expressions](https://maplibre.org/maplibre-style-spec/expressions/)

---

*This plan ensures systematic, maintainable implementation of full MapLibre Style Spec expression support while maintaining code quality and performance standards.*
