// ============================================================================
// VALUE BUILDER - For PropertyValueSpecification (non-data-driven properties)
// ============================================================================
/**
 * Builder for PropertyValueSpecification<T> properties
 * For properties that don't support data-driven styling (expressions based on feature properties)
 * Supports literals, camera functions, and expressions
 */
export class Value {
    value;
    constructor(value) {
        this.value = value;
    }
    // Static factory methods
    static literal(value) {
        return new Value(value);
    }
    static expression(expression) {
        return new Value(expression.forge());
    }
    static cameraFunction(fn) {
        return new Value(fn);
    }
    forge() {
        return this.value;
    }
}
/**
 * MapLibre Expression Builder - Complete Type-Safe API for MapLibre Expressions
 *
 * 🎯 FLUENT API IS THE RECOMMENDED APPROACH - Use chainable methods for better ergonomics!
 *
 * This builder system provides:
 * 1. Expression - Core fluent API for all expression types
 * 2. Property - For DataDrivenPropertyValueSpecification properties
 * 3. Value - For PropertyValueSpecification properties (non-data-driven)
 * 4. Layer - For complete layer specifications
 *
 * @example
 * // ✅ RECOMMENDED: Fluent API - more readable and ergonomic
 * const expr = Expression.get('id')
 *   .toNumber()
 *   .mod(256)
 *   .match()
 *   .branches({ 0: '#ff0000', 1: '#00ff00', 2: '#0000ff' })
 *   .fallback('#64748b');
 *
 * @example
 * // ❌ AVOID: Static API - less ergonomic (still supported for compatibility)
 * const expr = Expression.match(
 *   Expression.mod(Expression.toNumber(Expression.get('id')), 256),
 *   { 0: '#ff0000', 1: '#00ff00', 2: '#0000ff' },
 *   '#64748b'
 * );
 *
 * @example
 * // Complex fluent expression - this is where fluent API shines
 * const complexExpr = Expression.when(Expression.has('id'))
 *   .then(Expression.get('category').match()
 *     .branches({ residential: '#ffeb3b', commercial: '#2196f3' })
 *     .fallback('#64748b'))
 *   .else('#64748b');
 *
 * @example
 * // Using Property for layer properties - fluent API
 * const fillColor = Property.expression(
 *   Expression.get('id').toNumber().mod(256)
 *     .match()
 *     .branches({ 0: '#ff0000', 1: '#00ff00' })
 *     .fallback('#64748b')
 * );
 *
 * @example
 * // Using Value for non-data-driven properties
 * const visibility = Value.literal<'visible' | 'none'>('visible');
 *
 * @example
 * // Using Layer for complete layers - fluent API
 * const layer = new Layer('fill', 'my-layer', 'my-source', 'my-layer')
 *   .fillColor(fillColor.forge())
 *   .fillOpacity(0.8)
 *   .visibility('visible')
 *   .forge();
 */
// ============================================================================
// CONDITIONAL BUILDER - More ergonomic when/then/else API (Prisma/Drizzle inspired)
// ============================================================================
/**
 * Builder for conditional expressions with when/then/else chaining
 * More readable and ergonomic than traditional case statements
 */
export class ConditionalBuilder {
    conditions = [];
    elseValue;
    constructor() { }
    /**
     * Adds a when-then condition to the builder
     */
    when(condition) {
        return new ConditionalThenBuilder(this, condition);
    }
    /**
     * Adds an else clause to the conditional
     */
    else(value) {
        this.elseValue = value;
        return this.forge();
    }
    /**
     * Builds the final case expression
     */
    forge() {
        const caseExpr = ['case'];
        // Add all when-then pairs
        for (const { when, then } of this.conditions) {
            const whenSpec = when instanceof Expression ? when.forge() : when;
            const thenSpec = then instanceof Expression ? then.forge() : then;
            caseExpr.push(whenSpec, thenSpec);
        }
        // Add else if present
        if (this.elseValue !== undefined) {
            const elseSpec = this.elseValue instanceof Expression ? this.elseValue.forge() : this.elseValue;
            caseExpr.push(elseSpec);
        }
        return new Expression(caseExpr);
    }
    addCondition(when, then) {
        this.conditions.push({ when, then });
    }
    setElse(value) {
        this.elseValue = value;
    }
}
/**
 * Builder for the "then" part of conditional expressions
 */
export class ConditionalThenBuilder {
    conditionalBuilder;
    whenCondition;
    constructor(conditionalBuilder, whenCondition) {
        this.conditionalBuilder = conditionalBuilder;
        this.whenCondition = whenCondition;
    }
    /**
     * Adds the "then" value for the previous "when" condition
     */
    then(value) {
        this.conditionalBuilder.addCondition(this.whenCondition, value);
        return this.conditionalBuilder;
    }
}
/**
 * Builder for match expressions with branches/fallback chaining
 * Supports object-based mappings with fluent API
 */
export class MatchBuilder {
    conditions = [];
    input;
    elseValue;
    constructor(input) {
        this.input = input;
    }
    /**
     * Builds the final match expression
     */
    forge() {
        const matchExpr = ['match'];
        // Add input
        const inputSpec = this.input instanceof Expression ? this.input.forge() : this.input;
        matchExpr.push(inputSpec);
        // Add all when-then pairs
        for (const { when, then } of this.conditions) {
            matchExpr.push(when);
            const thenSpec = then instanceof Expression ? then.forge() : then;
            matchExpr.push(thenSpec);
        }
        // Add else if present
        if (this.elseValue !== undefined) {
            const elseSpec = this.elseValue instanceof Expression ? this.elseValue.forge() : this.elseValue;
            matchExpr.push(elseSpec);
        }
        return new Expression(matchExpr);
    }
    /**
     * Traditional chaining API for dense mappings - adds all branches at once
     */
    branches(branches) {
        for (const [key, value] of Object.entries(branches)) {
            const parsedKey = isNaN(Number(key)) ? key : Number(key);
            this.conditions.push({ when: parsedKey, then: value });
        }
        return new MatchFallbackBuilder(this);
    }
    addCondition(when, then) {
        this.conditions.push({ when, then });
    }
    setElse(value) {
        this.elseValue = value;
    }
}
/**
 * Builder for the fallback part of match expressions (for traditional .branches().fallback() API)
 */
export class MatchFallbackBuilder {
    matchBuilder;
    constructor(matchBuilder) {
        this.matchBuilder = matchBuilder;
    }
    /**
     * Adds the fallback value for the match expression
     */
    fallback(value) {
        this.matchBuilder.setElse(value);
        return this.matchBuilder.forge();
    }
}
/**
 * Builder for let expressions with variable binding
 * Supports fluent API for creating variable-scoped expressions
 */
export class LetBuilder {
    bindings;
    constructor(bindings) {
        this.bindings = bindings;
    }
    /**
     * Builds the final let expression with the provided result expression
     */
    in(resultExpression) {
        const letExpr = ['let'];
        // Add all variable bindings as alternating name-value pairs
        for (const [name, value] of Object.entries(this.bindings)) {
            letExpr.push(name);
            const valueSpec = value instanceof Expression ? value.forge() : value;
            letExpr.push(valueSpec);
        }
        // Add the final expression
        const resultSpec = resultExpression instanceof Expression ? resultExpression.forge() : resultExpression;
        letExpr.push(resultSpec);
        return new Expression(letExpr);
    }
}
// ============================================================================
// EXPRESSION BUILDER - Core fluent API for MapLibre expressions
// ============================================================================
/**
 * Core Expression class for creating type-safe MapLibre expressions
 * Supports all expression operators with fluent chaining
 */
export class Expression {
    expression;
    constructor(expression) {
        this.expression = expression;
    }
    // Static factory methods for common expressions
    static literal(value) {
        return new Expression(['literal', value]);
    }
    static get(property) {
        return new Expression(['get', property]);
    }
    static has(property) {
        return new Expression(['has', property]);
    }
    static zoom() {
        return new Expression(['zoom']);
    }
    static globalState(property) {
        return new Expression(['global-state', property]);
    }
    static elevation() {
        return new Expression(['elevation']);
    }
    static var(arg) {
        if (typeof arg === 'string') {
            // Reference a variable
            return new Expression(['var', arg]);
        }
        else {
            // Create variable bindings
            return { __brand: 'VarBindings', bindings: arg };
        }
    }
    static let(bindings, varFn) {
        if (varFn) {
            // Functional syntax: compute additional bindings and return final expression
            const result = varFn(bindings);
            const additionalBindings = result.bindings;
            // Combine initial and additional bindings
            const allBindings = { ...bindings, ...additionalBindings };
            // Build let expression
            const letExpr = ['let'];
            for (const [name, value] of Object.entries(allBindings)) {
                const valueSpec = value instanceof Expression ? value.forge() : value;
                letExpr.push(name, valueSpec);
            }
            // Return reference to the last additional binding (or last initial if no additional)
            const resultKeys = Object.keys(additionalBindings);
            const resultKey = resultKeys.length > 0
                ? resultKeys[resultKeys.length - 1]
                : Object.keys(bindings)[Object.keys(bindings).length - 1];
            letExpr.push(['var', resultKey]);
            return new Expression(letExpr);
        }
        else {
            // Builder pattern: return LetBuilder for .in() chaining
            return new LetBuilder(bindings);
        }
    }
    static match(input, branches) {
        const expr = input instanceof Expression ? input : new Expression(input);
        const builder = new MatchBuilder(expr);
        return branches ? builder.branches(branches) : builder;
    }
    static interpolate(interpolation, input, ...stops) {
        const args = ['interpolate', interpolation, input.forge()];
        for (const stop of stops) {
            if (stop instanceof Expression) {
                args.push(stop.forge());
            }
            else {
                args.push(stop);
            }
        }
        return new Expression(args);
    }
    static step(input, min, ...stops) {
        const args = ['step', input.forge(), min instanceof Expression ? min.forge() : min];
        for (const stop of stops) {
            if (stop instanceof Expression) {
                args.push(stop.forge());
            }
            else {
                args.push(stop);
            }
        }
        return new Expression(args);
    }
    // Type system expressions
    static coalesce(...values) {
        const args = ['coalesce', ...values.map((v) => (v instanceof Expression ? v.forge() : v))];
        return new Expression(args);
    }
    // Mathematical operations
    static add(...values) {
        const args = ['+', ...values.map((v) => (v instanceof Expression ? v.forge() : v))];
        return new Expression(args);
    }
    static subtract(a, b) {
        return new Expression(['-', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    static multiply(...values) {
        const args = ['*', ...values.map((v) => (v instanceof Expression ? v.forge() : v))];
        return new Expression(args);
    }
    static divide(a, b) {
        return new Expression(['/', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    static mod(a, b) {
        return new Expression(['%', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    static pow(base, exponent) {
        return new Expression([
            '^',
            base instanceof Expression ? base.forge() : base,
            exponent instanceof Expression ? exponent.forge() : exponent,
        ]);
    }
    // Mathematical constants
    static e() {
        return new Expression(['e']);
    }
    static pi() {
        return new Expression(['pi']);
    }
    static ln2() {
        return new Expression(['ln2']);
    }
    // Comparison operations
    static eq(a, b) {
        return new Expression(['==', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    static neq(a, b) {
        return new Expression(['!=', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    static gt(a, b) {
        return new Expression(['>', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    static gte(a, b) {
        return new Expression(['>=', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    static lt(a, b) {
        return new Expression(['<', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    static lte(a, b) {
        return new Expression(['<=', a instanceof Expression ? a.forge() : a, b instanceof Expression ? b.forge() : b]);
    }
    // Logical operations
    static and(...conditions) {
        const args = ['all', ...conditions.map((c) => (c instanceof Expression ? c.forge() : c))];
        return new Expression(args);
    }
    static or(...conditions) {
        const args = ['any', ...conditions.map((c) => (c instanceof Expression ? c.forge() : c))];
        return new Expression(args);
    }
    static not(condition) {
        return new Expression(['!', condition instanceof Expression ? condition.forge() : condition]);
    }
    // Type conversion
    static toNumber(value) {
        return new Expression(['to-number', value instanceof Expression ? value.forge() : value]);
    }
    static toString(value) {
        return new Expression(['to-string', value instanceof Expression ? value.forge() : value]);
    }
    static toBoolean(value) {
        return new Expression(['to-boolean', value instanceof Expression ? value.forge() : value]);
    }
    static toColor(value) {
        return new Expression(['to-color', value instanceof Expression ? value.forge() : value]);
    }
    // Type assertions
    static string(value) {
        return new Expression(['string', value instanceof Expression ? value.forge() : value]);
    }
    static number(value) {
        return new Expression(['number', value instanceof Expression ? value.forge() : value]);
    }
    static boolean(value) {
        return new Expression(['boolean', value instanceof Expression ? value.forge() : value]);
    }
    static array(value, itemType) {
        const args = ['array', value instanceof Expression ? value.forge() : value];
        if (itemType) {
            args.splice(1, 0, itemType);
        }
        return new Expression(args);
    }
    static object(value) {
        return new Expression(['object', value instanceof Expression ? value.forge() : value]);
    }
    static typeof(value) {
        return new Expression(['typeof', value instanceof Expression ? value.forge() : value]);
    }
    // Advanced type expressions
    static collator(options) {
        const args = ['collator'];
        if (options) {
            const collatorOptions = {};
            if (options['case-sensitive'] !== undefined) {
                collatorOptions['case-sensitive'] =
                    options['case-sensitive'] instanceof Expression
                        ? options['case-sensitive'].forge()
                        : options['case-sensitive'];
            }
            if (options['diacritic-sensitive'] !== undefined) {
                collatorOptions['diacritic-sensitive'] =
                    options['diacritic-sensitive'] instanceof Expression
                        ? options['diacritic-sensitive'].forge()
                        : options['diacritic-sensitive'];
            }
            if (options.locale !== undefined) {
                collatorOptions.locale = options.locale instanceof Expression ? options.locale.forge() : options.locale;
            }
            args.push(collatorOptions);
        }
        return new Expression(args);
    }
    static format(...sections) {
        const args = ['format'];
        for (const section of sections) {
            if (typeof section === 'string' || section instanceof Expression) {
                args.push(section instanceof Expression ? section.forge() : section);
            }
            else if (section && typeof section === 'object' && !Array.isArray(section)) {
                // This is a formatted section object
                const formatSection = section;
                const formattedSection = {};
                if (formatSection['font-scale'] !== undefined) {
                    formattedSection['font-scale'] =
                        formatSection['font-scale'] instanceof Expression
                            ? formatSection['font-scale'].forge()
                            : formatSection['font-scale'];
                }
                if (formatSection['text-font'] !== undefined) {
                    formattedSection['text-font'] =
                        formatSection['text-font'] instanceof Expression
                            ? formatSection['text-font'].forge()
                            : formatSection['text-font'];
                }
                if (formatSection['text-color'] !== undefined) {
                    formattedSection['text-color'] =
                        formatSection['text-color'] instanceof Expression
                            ? formatSection['text-color'].forge()
                            : formatSection['text-color'];
                }
                if (formatSection['vertical-align'] !== undefined) {
                    formattedSection['vertical-align'] = formatSection['vertical-align'];
                }
                args.push(formattedSection);
            }
        }
        return new Expression(args);
    }
    // String operations
    static concat(...values) {
        const args = ['concat', ...values.map((v) => (v instanceof Expression ? v.forge() : v))];
        return new Expression(args);
    }
    static downcase(value) {
        return new Expression(['downcase', value instanceof Expression ? value.forge() : value]);
    }
    static upcase(value) {
        return new Expression(['upcase', value instanceof Expression ? value.forge() : value]);
    }
    // ============================================================================
    // FLUENT CHAINING METHODS (Prisma/Drizzle-inspired) - RECOMMENDED API
    // ============================================================================
    // These chainable methods provide the most ergonomic and readable API.
    // Prefer these over static methods for better developer experience.
    /**
     * Starts a conditional expression builder with when/then/else
     * More ergonomic than traditional case statements
     */
    static when(condition) {
        const builder = new ConditionalBuilder();
        return new ConditionalThenBuilder(builder, condition);
    }
    /**
     * Alias for when() - starts a conditional expression
     */
    static conditional(condition) {
        return Expression.when(condition);
    }
    match(branches) {
        const builder = new MatchBuilder(this);
        return branches ? builder.branches(branches) : builder;
    }
    // Mathematical operations as chainable methods
    add(...values) {
        const args = ['+', this.forge(), ...values.map((v) => (v instanceof Expression ? v.forge() : v))];
        return new Expression(args);
    }
    subtract(value) {
        return new Expression(['-', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    multiply(...values) {
        const args = ['*', this.forge(), ...values.map((v) => (v instanceof Expression ? v.forge() : v))];
        return new Expression(args);
    }
    divide(value) {
        return new Expression(['/', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    mod(value) {
        return new Expression(['%', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    pow(exponent) {
        return new Expression(['^', this.forge(), exponent instanceof Expression ? exponent.forge() : exponent]);
    }
    sqrt() {
        return new Expression(['sqrt', this.forge()]);
    }
    log10() {
        return new Expression(['log10', this.forge()]);
    }
    // Comparison operations as chainable methods
    eq(value) {
        return new Expression(['==', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    neq(value) {
        return new Expression(['!=', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    gt(value) {
        return new Expression(['>', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    gte(value) {
        return new Expression(['>=', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    lt(value) {
        return new Expression(['<', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    lte(value) {
        return new Expression(['<=', this.forge(), value instanceof Expression ? value.forge() : value]);
    }
    // Logical operations as chainable methods
    and(...conditions) {
        const args = ['all', this.forge(), ...conditions.map((c) => (c instanceof Expression ? c.forge() : c))];
        return new Expression(args);
    }
    or(...conditions) {
        const args = ['any', this.forge(), ...conditions.map((c) => (c instanceof Expression ? c.forge() : c))];
        return new Expression(args);
    }
    // Type conversion as chainable methods
    toNumber() {
        return new Expression(['to-number', this.forge()]);
    }
    toString() {
        return new Expression(['to-string', this.forge()]);
    }
    toBoolean() {
        return new Expression(['to-boolean', this.forge()]);
    }
    toColor() {
        return new Expression(['to-color', this.forge()]);
    }
    // Type assertions as chainable methods
    string() {
        return new Expression(['string', this.forge()]);
    }
    number() {
        return new Expression(['number', this.forge()]);
    }
    boolean() {
        return new Expression(['boolean', this.forge()]);
    }
    array(itemType) {
        const args = ['array', this.forge()];
        if (itemType) {
            args.splice(1, 0, itemType);
        }
        return new Expression(args);
    }
    object() {
        return new Expression(['object', this.forge()]);
    }
    typeof() {
        return new Expression(['typeof', this.forge()]);
    }
    // Advanced type expressions as chainable methods
    image() {
        return new Expression(['image', this.forge()]);
    }
    numberFormat(options) {
        const args = ['number-format', this.forge()];
        if (options) {
            const formatOptions = {};
            if (options.locale !== undefined) {
                formatOptions.locale = options.locale instanceof Expression ? options.locale.forge() : options.locale;
            }
            if (options.currency !== undefined) {
                formatOptions.currency = options.currency instanceof Expression ? options.currency.forge() : options.currency;
            }
            if (options['min-fraction-digits'] !== undefined) {
                formatOptions['min-fraction-digits'] =
                    options['min-fraction-digits'] instanceof Expression
                        ? options['min-fraction-digits'].forge()
                        : options['min-fraction-digits'];
            }
            if (options['max-fraction-digits'] !== undefined) {
                formatOptions['max-fraction-digits'] =
                    options['max-fraction-digits'] instanceof Expression
                        ? options['max-fraction-digits'].forge()
                        : options['max-fraction-digits'];
            }
            args.push(formatOptions);
        }
        return new Expression(args);
    }
    resolvedLocale() {
        return new Expression(['resolved-locale', this.forge()]);
    }
    isSupportedScript() {
        return new Expression(['is-supported-script', this.forge()]);
    }
    // String operations as chainable methods
    concat(...values) {
        const args = ['concat', this.forge(), ...values.map((v) => (v instanceof Expression ? v.forge() : v))];
        return new Expression(args);
    }
    downcase() {
        return new Expression(['downcase', this.forge()]);
    }
    upcase() {
        return new Expression(['upcase', this.forge()]);
    }
    // Lookup operations as chainable methods
    length() {
        return new Expression(['length', this.forge()]);
    }
    at(index) {
        return new Expression(['at', index instanceof Expression ? index.forge() : index, this.forge()]);
    }
    slice(start, end) {
        const args = ['slice', this.forge(), start instanceof Expression ? start.forge() : start];
        if (end !== undefined) {
            args.push(end instanceof Expression ? end.forge() : end);
        }
        return new Expression(args);
    }
    in(collection) {
        return new Expression(['in', this.forge(), collection instanceof Expression ? collection.forge() : collection]);
    }
    indexOf(item, fromIndex) {
        const args = ['index-of', item instanceof Expression ? item.forge() : item, this.forge()];
        if (fromIndex !== undefined) {
            args.push(fromIndex instanceof Expression ? fromIndex.forge() : fromIndex);
        }
        return new Expression(args);
    }
    // Interpolation as chainable method
    interpolate(interpolation, ...stops) {
        const args = ['interpolate', interpolation, this.forge()];
        args.push(...stops.map((stop) => (stop instanceof Expression ? stop.forge() : stop)));
        return new Expression(args);
    }
    interpolateHcl(...stops) {
        const args = ['interpolate-hcl', this.forge()];
        args.push(...stops.map((stop) => (stop instanceof Expression ? stop.forge() : stop)));
        return new Expression(args);
    }
    interpolateLab(...stops) {
        const args = ['interpolate-lab', this.forge()];
        args.push(...stops.map((stop) => (stop instanceof Expression ? stop.forge() : stop)));
        return new Expression(args);
    }
    // Step as chainable method
    step(min, ...stops) {
        const args = ['step', this.forge(), min instanceof Expression ? min.forge() : min];
        args.push(...stops.map((stop) => (stop instanceof Expression ? stop.forge() : stop)));
        return new Expression(args);
    }
    // Type system expressions as chainable methods
    coalesce(...values) {
        const args = ['coalesce', this.forge(), ...values.map((v) => (v instanceof Expression ? v.forge() : v))];
        return new Expression(args);
    }
    // theoretically correct signature: distance(geojson: GeoJSON.GeoJSON | Expression | ExpressionSpecification): Expression
    // but to conform to style spec typing and better DX, we use
    distance(geojson) {
        let geojsonExpr;
        if (geojson instanceof Expression) {
            geojsonExpr = geojson.forge();
        }
        else if (Array.isArray(geojson)) {
            geojsonExpr = geojson;
        }
        else {
            geojsonExpr = geojson;
        }
        return new Expression(['distance', geojsonExpr]);
    }
    // theoretically correct signature: distance(geojson: GeoJSON.GeoJSON | Expression | ExpressionSpecification): Expression
    // but to conform to style spec typing and better DX, we use
    within(geojson) {
        let geojsonExpr;
        if (geojson instanceof Expression) {
            geojsonExpr = geojson.forge();
        }
        else if (Array.isArray(geojson)) {
            geojsonExpr = geojson;
        }
        else {
            geojsonExpr = geojson;
        }
        return new Expression(['within', geojsonExpr]);
    }
    // Build the final expression
    forge() {
        return this.expression;
    }
}
// ============================================================================
// PROPERTY BUILDER - For DataDrivenPropertyValueSpecification
// ============================================================================
/**
 * Builder for DataDrivenPropertyValueSpecification<T> properties
 * Supports expressions, functions, and literal values
 */
export class Property {
    value;
    constructor(value) {
        this.value = value;
    }
    // Static factory methods
    static literal(value) {
        return new Property(value);
    }
    static expression(expression) {
        return new Property(expression.forge());
    }
    static cameraFunction(fn) {
        return new Property(fn);
    }
    static sourceFunction(fn) {
        return new Property(fn);
    }
    static compositeFunction(fn) {
        return new Property(fn);
    }
    // Chainable methods for expressions
    static interpolate(interpolation, input, ...stops) {
        const expr = Expression.interpolate(interpolation, input, ...stops);
        return Property.expression(expr);
    }
    static step(input, min, ...stops) {
        const expr = Expression.step(input, min, ...stops);
        return Property.expression(expr);
    }
    forge() {
        return this.value;
    }
}
// ============================================================================
// LAYER BUILDER - For complete layer specifications
// ============================================================================
/**
 * Builder for layer specifications with fluent API for paint/layout properties
 */
export class Layer {
    layer = {};
    constructor(type, id, source, sourceLayer) {
        this.layer = { id, type, source, ...(sourceLayer && { 'source-layer': sourceLayer }) };
    }
    // Layout properties (common across layer types)
    visibility(visibility) {
        if (!this.layer.layout)
            this.layer.layout = {};
        this.layer.layout.visibility = visibility;
        return this;
    }
    // Paint properties - Fill layer
    fillColor(color) {
        if (!this.layer.paint)
            this.layer.paint = {};
        this.layer.paint['fill-color'] = color;
        return this;
    }
    fillOpacity(opacity) {
        if (!this.layer.paint)
            this.layer.paint = {};
        this.layer.paint['fill-opacity'] = opacity;
        return this;
    }
    fillOutlineColor(color) {
        if (!this.layer.paint)
            this.layer.paint = {};
        this.layer.paint['fill-outline-color'] = color;
        return this;
    }
    // Paint properties - Line layer
    lineColor(color) {
        if (!this.layer.paint)
            this.layer.paint = {};
        this.layer.paint['line-color'] = color;
        return this;
    }
    lineWidth(width) {
        if (!this.layer.paint)
            this.layer.paint = {};
        this.layer.paint['line-width'] = width;
        return this;
    }
    // Paint properties - Circle layer
    circleColor(color) {
        if (!this.layer.paint)
            this.layer.paint = {};
        this.layer.paint['circle-color'] = color;
        return this;
    }
    circleRadius(radius) {
        if (!this.layer.paint)
            this.layer.paint = {};
        this.layer.paint['circle-radius'] = radius;
        return this;
    }
    // Layout properties - Symbol layer
    textField(field) {
        if (!this.layer.layout)
            this.layer.layout = {};
        this.layer.layout['text-field'] = field;
        return this;
    }
    textSize(size) {
        if (!this.layer.layout)
            this.layer.layout = {};
        this.layer.layout['text-size'] = size;
        return this;
    }
    // Generic property setter for any paint/layout property
    setPaintProperty(key, value) {
        if (!this.layer.paint)
            this.layer.paint = {};
        this.layer.paint[key] = value;
        return this;
    }
    setLayoutProperty(key, value) {
        if (!this.layer.layout)
            this.layer.layout = {};
        this.layer.layout[key] = value;
        return this;
    }
    // Metadata and other properties
    metadata(metadata) {
        this.layer.metadata = metadata;
        return this;
    }
    minZoom(zoom) {
        this.layer['minzoom'] = zoom;
        return this;
    }
    maxZoom(zoom) {
        this.layer['maxzoom'] = zoom;
        return this;
    }
    filter(filter) {
        this.layer.filter = filter;
        return this;
    }
    forge() {
        return this.layer;
    }
}
