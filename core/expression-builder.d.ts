import type { GeoJSON } from 'geojson';
import type { ExpressionSpecification, DataDrivenPropertyValueSpecification, PropertyValueSpecification, CameraFunctionSpecification, SourceFunctionSpecification, CompositeFunctionSpecification, ColorSpecification, InterpolationSpecification } from '@maplibre/maplibre-gl-style-spec';
/**
 * Builder for PropertyValueSpecification<T> properties
 * For properties that don't support data-driven styling (expressions based on feature properties)
 * Supports literals, camera functions, and expressions
 */
export declare class Value<T> {
    private value;
    constructor(value: PropertyValueSpecification<T>);
    static literal<T>(value: T): Value<T>;
    static expression<T>(expression: Expression): Value<T>;
    static cameraFunction<T>(fn: CameraFunctionSpecification<T>): Value<T>;
    forge(): PropertyValueSpecification<T>;
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
/**
 * Builder for conditional expressions with when/then/else chaining
 * More readable and ergonomic than traditional case statements
 */
export declare class ConditionalBuilder {
    private conditions;
    private elseValue?;
    constructor();
    /**
     * Adds a when-then condition to the builder
     */
    when(condition: Expression | ExpressionSpecification | boolean): ConditionalThenBuilder;
    /**
     * Adds an else clause to the conditional
     */
    else(value: Expression | ExpressionSpecification | any): Expression;
    /**
     * Builds the final case expression
     */
    forge(): Expression;
    addCondition(when: Expression | ExpressionSpecification | boolean, then: Expression | ExpressionSpecification | any): void;
    setElse(value: Expression | ExpressionSpecification | any): void;
}
/**
 * Builder for the "then" part of conditional expressions
 */
export declare class ConditionalThenBuilder {
    private conditionalBuilder;
    private whenCondition;
    constructor(conditionalBuilder: ConditionalBuilder, whenCondition: Expression | ExpressionSpecification | boolean);
    /**
     * Adds the "then" value for the previous "when" condition
     */
    then(value: Expression | ExpressionSpecification | any): ConditionalBuilder;
}
/**
 * Builder for match expressions with branches/fallback chaining
 * Supports object-based mappings with fluent API
 */
export declare class MatchBuilder {
    private conditions;
    private input;
    private elseValue?;
    constructor(input: Expression | ExpressionSpecification);
    /**
     * Builds the final match expression
     */
    forge(): Expression;
    /**
     * Traditional chaining API for dense mappings - adds all branches at once
     */
    branches(branches: Record<string | number, Expression | ExpressionSpecification | any>): MatchFallbackBuilder;
    addCondition(when: string | number, then: Expression | ExpressionSpecification | any): void;
    setElse(value: Expression | ExpressionSpecification | any): void;
}
/**
 * Builder for the fallback part of match expressions (for traditional .branches().fallback() API)
 */
export declare class MatchFallbackBuilder {
    private matchBuilder;
    constructor(matchBuilder: MatchBuilder);
    /**
     * Adds the fallback value for the match expression
     */
    fallback(value: Expression | ExpressionSpecification | any): Expression;
}
/**
 * Builder for let expressions with variable binding
 * Supports fluent API for creating variable-scoped expressions
 */
export declare class LetBuilder {
    private bindings;
    constructor(bindings: Record<string, Expression | ExpressionSpecification | any>);
    /**
     * Builds the final let expression with the provided result expression
     */
    in(resultExpression: Expression | ExpressionSpecification | any): Expression;
}
/**
 * Opaque type for variable bindings that can only be created through the $bind function.
 * This prevents arbitrary object construction in varFn callbacks.
 */
export type VarBindings = {
    readonly __brand: 'VarBindings';
    readonly bindings: Record<string, Expression | ExpressionSpecification | any>;
};
/**
 * Core Expression class for creating type-safe MapLibre expressions
 * Supports all expression operators with fluent chaining
 */
export declare class Expression {
    private expression;
    constructor(expression: ExpressionSpecification);
    static literal(value: any): Expression;
    static get(property: string): Expression;
    static has(property: string): Expression;
    static zoom(): Expression;
    static globalState(property: string): Expression;
    static elevation(): Expression;
    static var(variableName: string): Expression;
    static var<T extends Record<string, Expression | ExpressionSpecification | any>>(bindings: T): VarBindings;
    static let<T extends Record<string, Expression | ExpressionSpecification | any>>(bindings: T): LetBuilder;
    static let<T extends Record<string, Expression | ExpressionSpecification | any>>(bindings: T, varFn: (boundVars: T) => VarBindings): Expression;
    static match(input: Expression | ExpressionSpecification): MatchBuilder;
    static match(input: Expression | ExpressionSpecification, branches: Record<string | number, Expression | ExpressionSpecification | any>): MatchFallbackBuilder;
    static interpolate(interpolation: InterpolationSpecification, input: Expression, ...stops: (number | Expression | any)[]): Expression;
    static step(input: Expression, min: number | Expression, ...stops: (number | Expression | any)[]): Expression;
    static coalesce(...values: (Expression | ExpressionSpecification | any)[]): Expression;
    static add(...values: (number | Expression)[]): Expression;
    static subtract(a: number | Expression, b: number | Expression): Expression;
    static multiply(...values: (number | Expression)[]): Expression;
    static divide(a: number | Expression, b: number | Expression): Expression;
    static mod(a: number | Expression, b: number | Expression): Expression;
    static pow(base: number | Expression, exponent: number | Expression): Expression;
    static e(): Expression;
    static pi(): Expression;
    static ln2(): Expression;
    static eq(a: any, b: any): Expression;
    static neq(a: any, b: any): Expression;
    static gt(a: number | Expression, b: number | Expression): Expression;
    static gte(a: number | Expression, b: number | Expression): Expression;
    static lt(a: number | Expression, b: number | Expression): Expression;
    static lte(a: number | Expression, b: number | Expression): Expression;
    static and(...conditions: (boolean | Expression)[]): Expression;
    static or(...conditions: (boolean | Expression)[]): Expression;
    static not(condition: boolean | Expression): Expression;
    static toNumber(value: Expression | string | number): Expression;
    static toString(value: Expression | any): Expression;
    static toBoolean(value: Expression | any): Expression;
    static toColor(value: Expression | string | any): Expression;
    static string(value: Expression | any): Expression;
    static number(value: Expression | any): Expression;
    static boolean(value: Expression | any): Expression;
    static array(value: Expression | any, itemType?: string): Expression;
    static object(value: Expression | any): Expression;
    static typeof(value: Expression | any): Expression;
    static collator(options?: {
        'case-sensitive'?: boolean | Expression | ExpressionSpecification;
        'diacritic-sensitive'?: boolean | Expression | ExpressionSpecification;
        locale?: string | Expression | ExpressionSpecification;
    }): Expression;
    static format(...sections: (string | Expression | ExpressionSpecification | {
        'font-scale'?: number | Expression | ExpressionSpecification;
        'text-font'?: Expression | ExpressionSpecification;
        'text-color'?: string | Expression | ExpressionSpecification;
        'vertical-align'?: 'bottom' | 'center' | 'top';
    })[]): Expression;
    static concat(...values: (string | Expression)[]): Expression;
    static downcase(value: string | Expression): Expression;
    static upcase(value: string | Expression): Expression;
    /**
     * Starts a conditional expression builder with when/then/else
     * More ergonomic than traditional case statements
     */
    static when(condition: Expression | ExpressionSpecification | boolean): ConditionalThenBuilder;
    /**
     * Alias for when() - starts a conditional expression
     */
    static conditional(condition: Expression | ExpressionSpecification | boolean): ConditionalThenBuilder;
    /**
     * Starts a match expression builder with this expression as input
     */
    match(): MatchBuilder;
    match(branches: Record<string | number, Expression | ExpressionSpecification | any>): MatchFallbackBuilder;
    add(...values: (number | Expression | ExpressionSpecification)[]): Expression;
    subtract(value: number | Expression | ExpressionSpecification): Expression;
    multiply(...values: (number | Expression | ExpressionSpecification)[]): Expression;
    divide(value: number | Expression | ExpressionSpecification): Expression;
    mod(value: number | Expression | ExpressionSpecification): Expression;
    pow(exponent: number | Expression | ExpressionSpecification): Expression;
    sqrt(): Expression;
    log10(): Expression;
    eq(value: Expression | ExpressionSpecification | any): Expression;
    neq(value: Expression | ExpressionSpecification | any): Expression;
    gt(value: number | Expression | ExpressionSpecification): Expression;
    gte(value: number | Expression | ExpressionSpecification): Expression;
    lt(value: number | Expression | ExpressionSpecification): Expression;
    lte(value: number | Expression | ExpressionSpecification): Expression;
    and(...conditions: (boolean | Expression | ExpressionSpecification)[]): Expression;
    or(...conditions: (boolean | Expression | ExpressionSpecification)[]): Expression;
    toNumber(): Expression;
    toString(): Expression;
    toBoolean(): Expression;
    toColor(): Expression;
    string(): Expression;
    number(): Expression;
    boolean(): Expression;
    array(itemType?: string): Expression;
    object(): Expression;
    typeof(): Expression;
    image(): Expression;
    numberFormat(options?: {
        locale?: string | Expression | ExpressionSpecification;
        currency?: string | Expression | ExpressionSpecification;
        'min-fraction-digits'?: number | Expression | ExpressionSpecification;
        'max-fraction-digits'?: number | Expression | ExpressionSpecification;
    }): Expression;
    resolvedLocale(): Expression;
    isSupportedScript(): Expression;
    concat(...values: (string | Expression | ExpressionSpecification)[]): Expression;
    downcase(): Expression;
    upcase(): Expression;
    length(): Expression;
    at(index: number | Expression | ExpressionSpecification): Expression;
    slice(start: number | Expression | ExpressionSpecification, end?: number | Expression | ExpressionSpecification): Expression;
    in(collection: string | Expression | ExpressionSpecification): Expression;
    indexOf(item: any | Expression | ExpressionSpecification, fromIndex?: number | Expression | ExpressionSpecification): Expression;
    interpolate(interpolation: InterpolationSpecification, ...stops: (number | Expression | ExpressionSpecification | any)[]): Expression;
    interpolateHcl(...stops: (number | Expression | ExpressionSpecification | any)[]): Expression;
    interpolateLab(...stops: (number | Expression | ExpressionSpecification | any)[]): Expression;
    step(min: number | Expression | ExpressionSpecification, ...stops: (number | Expression | ExpressionSpecification | any)[]): Expression;
    coalesce(...values: (Expression | ExpressionSpecification | any)[]): Expression;
    distance(geojson: GeoJSON | Expression | ExpressionSpecification): Expression;
    within(geojson: GeoJSON | Expression | ExpressionSpecification): Expression;
    forge(): ExpressionSpecification;
}
/**
 * Builder for DataDrivenPropertyValueSpecification<T> properties
 * Supports expressions, functions, and literal values
 */
export declare class Property<T> {
    private value;
    constructor(value: DataDrivenPropertyValueSpecification<T>);
    static literal<T>(value: T): Property<T>;
    static expression<T>(expression: Expression): Property<T>;
    static cameraFunction<T>(fn: CameraFunctionSpecification<T>): Property<T>;
    static sourceFunction<T>(fn: SourceFunctionSpecification<T>): Property<T>;
    static compositeFunction<T>(fn: CompositeFunctionSpecification<T>): Property<T>;
    static interpolate<T>(interpolation: InterpolationSpecification, input: Expression, ...stops: (number | T | Expression)[]): Property<T>;
    static step<T>(input: Expression, min: number | Expression, ...stops: (number | Expression)[]): Property<T>;
    forge(): DataDrivenPropertyValueSpecification<T>;
}
/**
 * Builder for layer specifications with fluent API for paint/layout properties
 */
export declare class Layer {
    private layer;
    constructor(type: string, id: string, source: string, sourceLayer?: string);
    visibility(visibility: 'visible' | 'none'): this;
    fillColor(color: DataDrivenPropertyValueSpecification<ColorSpecification>): this;
    fillOpacity(opacity: DataDrivenPropertyValueSpecification<number>): this;
    fillOutlineColor(color: DataDrivenPropertyValueSpecification<ColorSpecification>): this;
    lineColor(color: DataDrivenPropertyValueSpecification<ColorSpecification>): this;
    lineWidth(width: DataDrivenPropertyValueSpecification<number>): this;
    circleColor(color: DataDrivenPropertyValueSpecification<ColorSpecification>): this;
    circleRadius(radius: DataDrivenPropertyValueSpecification<number>): this;
    textField(field: DataDrivenPropertyValueSpecification<string>): this;
    textSize(size: DataDrivenPropertyValueSpecification<number>): this;
    setPaintProperty(key: string, value: any): this;
    setLayoutProperty(key: string, value: any): this;
    metadata(metadata: any): this;
    minZoom(zoom: number): this;
    maxZoom(zoom: number): this;
    filter(filter: ExpressionSpecification): this;
    forge(): any;
}
//# sourceMappingURL=expression-builder.d.ts.map