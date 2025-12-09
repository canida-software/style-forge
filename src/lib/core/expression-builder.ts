/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ExpressionSpecification,
  DataDrivenPropertyValueSpecification,
  PropertyValueSpecification,
  CameraFunctionSpecification,
  SourceFunctionSpecification,
  CompositeFunctionSpecification,
  ColorSpecification,
  InterpolationSpecification,
} from '@maplibre/maplibre-gl-style-spec';

// ============================================================================
// VALUE BUILDER - For PropertyValueSpecification (non-data-driven properties)
// ============================================================================

/**
 * Builder for PropertyValueSpecification<T> properties
 * For properties that don't support data-driven styling (expressions based on feature properties)
 * Supports literals, camera functions, and expressions
 */
export class Value<T> {
  private value: PropertyValueSpecification<T>;

  constructor(value: PropertyValueSpecification<T>) {
    this.value = value;
  }

  // Static factory methods
  static literal<T>(value: T): Value<T> {
    return new Value(value);
  }

  static expression<T>(expression: Expression): Value<T> {
    return new Value(expression.build() as PropertyValueSpecification<T>);
  }

  static cameraFunction<T>(fn: CameraFunctionSpecification<T>): Value<T> {
    return new Value(fn);
  }

  build(): PropertyValueSpecification<T> {
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
 *   .fillColor(fillColor.build())
 *   .fillOpacity(0.8)
 *   .visibility('visible')
 *   .build();
 */

// ============================================================================
// CONDITIONAL BUILDER - More ergonomic when/then/else API (Prisma/Drizzle inspired)
// ============================================================================

/**
 * Builder for conditional expressions with when/then/else chaining
 * More readable and ergonomic than traditional case statements
 */
export class ConditionalBuilder {
  private conditions: Array<{
    when: Expression | ExpressionSpecification | boolean;
    then: Expression | ExpressionSpecification | any;
  }> = [];
  private elseValue?: Expression | ExpressionSpecification | any;

  constructor() {}

  /**
   * Adds a when-then condition to the builder
   */
  when(condition: Expression | ExpressionSpecification | boolean): ConditionalThenBuilder {
    return new ConditionalThenBuilder(this, condition);
  }

  /**
   * Adds an else clause to the conditional
   */
  else(value: Expression | ExpressionSpecification | any): Expression {
    this.elseValue = value;
    return this.build();
  }

  /**
   * Builds the final case expression
   */
  build(): Expression {
    const caseExpr: any[] = ['case'];

    // Add all when-then pairs
    for (const { when, then } of this.conditions) {
      const whenSpec = when instanceof Expression ? when.build() : when;
      const thenSpec = then instanceof Expression ? then.build() : then;
      caseExpr.push(whenSpec, thenSpec);
    }

    // Add else if present
    if (this.elseValue !== undefined) {
      const elseSpec = this.elseValue instanceof Expression ? this.elseValue.build() : this.elseValue;
      caseExpr.push(elseSpec);
    }

    return new Expression(caseExpr as ExpressionSpecification);
  }

  addCondition(
    when: Expression | ExpressionSpecification | boolean,
    then: Expression | ExpressionSpecification | any,
  ): void {
    this.conditions.push({ when, then });
  }

  setElse(value: Expression | ExpressionSpecification | any): void {
    this.elseValue = value;
  }
}

/**
 * Builder for the "then" part of conditional expressions
 */
export class ConditionalThenBuilder {
  constructor(
    private conditionalBuilder: ConditionalBuilder,
    private whenCondition: Expression | ExpressionSpecification | boolean,
  ) {}

  /**
   * Adds the "then" value for the previous "when" condition
   */
  then(value: Expression | ExpressionSpecification | any): ConditionalBuilder {
    this.conditionalBuilder.addCondition(this.whenCondition, value);
    return this.conditionalBuilder;
  }
}

/**
 * Builder for match expressions with branches/fallback chaining
 * Supports object-based mappings with fluent API
 */
export class MatchBuilder {
  private conditions: Array<{ when: string | number; then: Expression | ExpressionSpecification | any }> = [];
  private input: Expression | ExpressionSpecification;
  private elseValue?: Expression | ExpressionSpecification | any;

  constructor(input: Expression | ExpressionSpecification) {
    this.input = input;
  }

  /**
   * Builds the final match expression
   */
  build(): Expression {
    const matchExpr: any[] = ['match'];

    // Add input
    const inputSpec = this.input instanceof Expression ? this.input.build() : this.input;
    matchExpr.push(inputSpec);

    // Add all when-then pairs
    for (const { when, then } of this.conditions) {
      matchExpr.push(when);
      const thenSpec = then instanceof Expression ? then.build() : then;
      matchExpr.push(thenSpec);
    }

    // Add else if present
    if (this.elseValue !== undefined) {
      const elseSpec = this.elseValue instanceof Expression ? this.elseValue.build() : this.elseValue;
      matchExpr.push(elseSpec);
    }

    return new Expression(matchExpr as ExpressionSpecification);
  }

  /**
   * Traditional chaining API for dense mappings - adds all branches at once
   */
  branches(branches: Record<string | number, Expression | ExpressionSpecification | any>): MatchFallbackBuilder {
    for (const [key, value] of Object.entries(branches)) {
      const parsedKey = isNaN(Number(key)) ? key : Number(key);
      this.conditions.push({ when: parsedKey, then: value });
    }
    return new MatchFallbackBuilder(this);
  }

  addCondition(when: string | number, then: Expression | ExpressionSpecification | any): void {
    this.conditions.push({ when, then });
  }

  setElse(value: Expression | ExpressionSpecification | any): void {
    this.elseValue = value;
  }
}

/**
 * Builder for the fallback part of match expressions (for traditional .branches().fallback() API)
 */
export class MatchFallbackBuilder {
  constructor(private matchBuilder: MatchBuilder) {}

  /**
   * Adds the fallback value for the match expression
   */
  fallback(value: Expression | ExpressionSpecification | any): Expression {
    this.matchBuilder.setElse(value);
    return this.matchBuilder.build();
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
  private expression: ExpressionSpecification;

  constructor(expression: ExpressionSpecification) {
    this.expression = expression;
  }

  // Static factory methods for common expressions
  static literal(value: any): Expression {
    return new Expression(['literal', value]);
  }

  static get(property: string): Expression {
    return new Expression(['get', property]);
  }

  static has(property: string): Expression {
    return new Expression(['has', property]);
  }

  static zoom(): Expression {
    return new Expression(['zoom']);
  }

  static globalState(property: string): Expression {
    return new Expression(['global-state', property]);
  }

  static match(input: Expression | ExpressionSpecification): MatchBuilder {
    return new MatchBuilder(input);
  }

  static interpolate(
    interpolation: InterpolationSpecification,
    input: Expression,
    ...stops: (number | Expression | any)[]
  ): Expression {
    const args: any[] = ['interpolate', interpolation, input.build()];
    for (const stop of stops) {
      if (stop instanceof Expression) {
        args.push(stop.build());
      } else {
        args.push(stop);
      }
    }
    return new Expression(args as ExpressionSpecification);
  }

  static step(input: Expression, min: number | Expression, ...stops: (number | Expression | any)[]): Expression {
    const args: any[] = ['step', input.build(), min instanceof Expression ? min.build() : min];
    for (const stop of stops) {
      if (stop instanceof Expression) {
        args.push(stop.build());
      } else {
        args.push(stop);
      }
    }
    return new Expression(args as ExpressionSpecification);
  }

  // Type system expressions
  static coalesce(...values: (Expression | ExpressionSpecification | any)[]): Expression {
    const args = ['coalesce', ...values.map((v) => (v instanceof Expression ? v.build() : v))];
    return new Expression(args as ExpressionSpecification);
  }

  // Mathematical operations
  static add(...values: (number | Expression)[]): Expression {
    const args = ['+', ...values.map((v) => (v instanceof Expression ? v.build() : v))];
    return new Expression(args as ExpressionSpecification);
  }

  static subtract(a: number | Expression, b: number | Expression): Expression {
    return new Expression(['-', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  static multiply(...values: (number | Expression)[]): Expression {
    const args = ['*', ...values.map((v) => (v instanceof Expression ? v.build() : v))];
    return new Expression(args as ExpressionSpecification);
  }

  static divide(a: number | Expression, b: number | Expression): Expression {
    return new Expression(['/', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  static mod(a: number | Expression, b: number | Expression): Expression {
    return new Expression(['%', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  static pow(base: number | Expression, exponent: number | Expression): Expression {
    return new Expression([
      '^',
      base instanceof Expression ? base.build() : base,
      exponent instanceof Expression ? exponent.build() : exponent,
    ]);
  }

  // Mathematical constants
  static e(): Expression {
    return new Expression(['e']);
  }

  static pi(): Expression {
    return new Expression(['pi']);
  }

  static ln2(): Expression {
    return new Expression(['ln2']);
  }

  // Comparison operations
  static eq(a: any, b: any): Expression {
    return new Expression(['==', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  static neq(a: any, b: any): Expression {
    return new Expression(['!=', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  static gt(a: number | Expression, b: number | Expression): Expression {
    return new Expression(['>', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  static gte(a: number | Expression, b: number | Expression): Expression {
    return new Expression(['>=', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  static lt(a: number | Expression, b: number | Expression): Expression {
    return new Expression(['<', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  static lte(a: number | Expression, b: number | Expression): Expression {
    return new Expression(['<=', a instanceof Expression ? a.build() : a, b instanceof Expression ? b.build() : b]);
  }

  // Logical operations
  static and(...conditions: (boolean | Expression)[]): Expression {
    const args = ['all', ...conditions.map((c) => (c instanceof Expression ? c.build() : c))];
    return new Expression(args as ExpressionSpecification);
  }

  static or(...conditions: (boolean | Expression)[]): Expression {
    const args = ['any', ...conditions.map((c) => (c instanceof Expression ? c.build() : c))];
    return new Expression(args as ExpressionSpecification);
  }

  static not(condition: boolean | Expression): Expression {
    return new Expression(['!', condition instanceof Expression ? condition.build() : condition]);
  }

  // Type conversion
  static toNumber(value: Expression | string | number): Expression {
    return new Expression(['to-number', value instanceof Expression ? value.build() : value]);
  }

  static toString(value: Expression | any): Expression {
    return new Expression(['to-string', value instanceof Expression ? value.build() : value]);
  }

  static toBoolean(value: Expression | any): Expression {
    return new Expression(['to-boolean', value instanceof Expression ? value.build() : value]);
  }

  static toColor(value: Expression | string | any): Expression {
    return new Expression(['to-color', value instanceof Expression ? value.build() : value]);
  }

  // Type assertions
  static string(value: Expression | any): Expression {
    return new Expression(['string', value instanceof Expression ? value.build() : value]);
  }

  static number(value: Expression | any): Expression {
    return new Expression(['number', value instanceof Expression ? value.build() : value]);
  }

  static boolean(value: Expression | any): Expression {
    return new Expression(['boolean', value instanceof Expression ? value.build() : value]);
  }

  static array(value: Expression | any, itemType?: string): Expression {
    const args: any[] = ['array', value instanceof Expression ? value.build() : value];
    if (itemType) {
      args.splice(1, 0, itemType);
    }
    return new Expression(args as ExpressionSpecification);
  }

  static object(value: Expression | any): Expression {
    return new Expression(['object', value instanceof Expression ? value.build() : value]);
  }

  static typeof(value: Expression | any): Expression {
    return new Expression(['typeof', value instanceof Expression ? value.build() : value]);
  }

  // Advanced type expressions
  static collator(options?: {
    'case-sensitive'?: boolean | Expression | ExpressionSpecification;
    'diacritic-sensitive'?: boolean | Expression | ExpressionSpecification;
    locale?: string | Expression | ExpressionSpecification;
  }): Expression {
    const args: any[] = ['collator'];
    if (options) {
      const collatorOptions: any = {};
      if (options['case-sensitive'] !== undefined) {
        collatorOptions['case-sensitive'] =
          options['case-sensitive'] instanceof Expression
            ? options['case-sensitive'].build()
            : options['case-sensitive'];
      }
      if (options['diacritic-sensitive'] !== undefined) {
        collatorOptions['diacritic-sensitive'] =
          options['diacritic-sensitive'] instanceof Expression
            ? options['diacritic-sensitive'].build()
            : options['diacritic-sensitive'];
      }
      if (options.locale !== undefined) {
        collatorOptions.locale = options.locale instanceof Expression ? options.locale.build() : options.locale;
      }
      args.push(collatorOptions);
    }
    return new Expression(args as ExpressionSpecification);
  }

  static format(
    ...sections: (
      | string
      | Expression
      | ExpressionSpecification
      | {
          'font-scale'?: number | Expression | ExpressionSpecification;
          'text-font'?: Expression | ExpressionSpecification;
          'text-color'?: string | Expression | ExpressionSpecification;
          'vertical-align'?: 'bottom' | 'center' | 'top';
        }
    )[]
  ): Expression {
    const args: any[] = ['format'];
    for (const section of sections) {
      if (typeof section === 'string' || section instanceof Expression) {
        args.push(section instanceof Expression ? section.build() : section);
      } else if (section && typeof section === 'object' && !Array.isArray(section)) {
        // This is a formatted section object
        const formatSection = section as {
          'font-scale'?: number | Expression | ExpressionSpecification;
          'text-font'?: Expression | ExpressionSpecification;
          'text-color'?: string | Expression | ExpressionSpecification;
          'vertical-align'?: 'bottom' | 'center' | 'top';
        };
        const formattedSection: any = {};
        if (formatSection['font-scale'] !== undefined) {
          formattedSection['font-scale'] =
            formatSection['font-scale'] instanceof Expression
              ? formatSection['font-scale'].build()
              : formatSection['font-scale'];
        }
        if (formatSection['text-font'] !== undefined) {
          formattedSection['text-font'] =
            formatSection['text-font'] instanceof Expression
              ? formatSection['text-font'].build()
              : formatSection['text-font'];
        }
        if (formatSection['text-color'] !== undefined) {
          formattedSection['text-color'] =
            formatSection['text-color'] instanceof Expression
              ? formatSection['text-color'].build()
              : formatSection['text-color'];
        }
        if (formatSection['vertical-align'] !== undefined) {
          formattedSection['vertical-align'] = formatSection['vertical-align'];
        }
        args.push(formattedSection);
      }
    }
    return new Expression(args as ExpressionSpecification);
  }

  // String operations
  static concat(...values: (string | Expression)[]): Expression {
    const args = ['concat', ...values.map((v) => (v instanceof Expression ? v.build() : v))];
    return new Expression(args as ExpressionSpecification);
  }

  static downcase(value: string | Expression): Expression {
    return new Expression(['downcase', value instanceof Expression ? value.build() : value]);
  }

  static upcase(value: string | Expression): Expression {
    return new Expression(['upcase', value instanceof Expression ? value.build() : value]);
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
  static when(condition: Expression | ExpressionSpecification | boolean): ConditionalThenBuilder {
    const builder = new ConditionalBuilder();
    return new ConditionalThenBuilder(builder, condition);
  }

  /**
   * Alias for when() - starts a conditional expression
   */
  static conditional(condition: Expression | ExpressionSpecification | boolean): ConditionalThenBuilder {
    return Expression.when(condition);
  }

  /**
   * Starts a match expression builder with this expression as input
   */
  match(): MatchBuilder {
    return new MatchBuilder(this);
  }

  // Mathematical operations as chainable methods
  add(...values: (number | Expression | ExpressionSpecification)[]): Expression {
    const args = ['+', this.build(), ...values.map((v) => (v instanceof Expression ? v.build() : v))];
    return new Expression(args as ExpressionSpecification);
  }

  subtract(value: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['-', this.build(), value instanceof Expression ? value.build() : value]);
  }

  multiply(...values: (number | Expression | ExpressionSpecification)[]): Expression {
    const args = ['*', this.build(), ...values.map((v) => (v instanceof Expression ? v.build() : v))];
    return new Expression(args as ExpressionSpecification);
  }

  divide(value: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['/', this.build(), value instanceof Expression ? value.build() : value]);
  }

  mod(value: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['%', this.build(), value instanceof Expression ? value.build() : value]);
  }

  pow(exponent: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['^', this.build(), exponent instanceof Expression ? exponent.build() : exponent]);
  }

  sqrt(): Expression {
    return new Expression(['sqrt', this.build()]);
  }

  log10(): Expression {
    return new Expression(['log10', this.build()]);
  }

  // Comparison operations as chainable methods
  eq(value: Expression | ExpressionSpecification | any): Expression {
    return new Expression(['==', this.build(), value instanceof Expression ? value.build() : value]);
  }

  neq(value: Expression | ExpressionSpecification | any): Expression {
    return new Expression(['!=', this.build(), value instanceof Expression ? value.build() : value]);
  }

  gt(value: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['>', this.build(), value instanceof Expression ? value.build() : value]);
  }

  gte(value: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['>=', this.build(), value instanceof Expression ? value.build() : value]);
  }

  lt(value: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['<', this.build(), value instanceof Expression ? value.build() : value]);
  }

  lte(value: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['<=', this.build(), value instanceof Expression ? value.build() : value]);
  }

  // Logical operations as chainable methods
  and(...conditions: (boolean | Expression | ExpressionSpecification)[]): Expression {
    const args = ['all', this.build(), ...conditions.map((c) => (c instanceof Expression ? c.build() : c))];
    return new Expression(args as ExpressionSpecification);
  }

  or(...conditions: (boolean | Expression | ExpressionSpecification)[]): Expression {
    const args = ['any', this.build(), ...conditions.map((c) => (c instanceof Expression ? c.build() : c))];
    return new Expression(args as ExpressionSpecification);
  }

  // Type conversion as chainable methods
  toNumber(): Expression {
    return new Expression(['to-number', this.build()]);
  }

  toString(): Expression {
    return new Expression(['to-string', this.build()]);
  }

  toBoolean(): Expression {
    return new Expression(['to-boolean', this.build()]);
  }

  toColor(): Expression {
    return new Expression(['to-color', this.build()]);
  }

  // Type assertions as chainable methods
  string(): Expression {
    return new Expression(['string', this.build()]);
  }

  number(): Expression {
    return new Expression(['number', this.build()]);
  }

  boolean(): Expression {
    return new Expression(['boolean', this.build()]);
  }

  array(itemType?: string): Expression {
    const args: any[] = ['array', this.build()];
    if (itemType) {
      args.splice(1, 0, itemType);
    }
    return new Expression(args as ExpressionSpecification);
  }

  object(): Expression {
    return new Expression(['object', this.build()]);
  }

  typeof(): Expression {
    return new Expression(['typeof', this.build()]);
  }

  // Advanced type expressions as chainable methods
  image(): Expression {
    return new Expression(['image', this.build()]);
  }

  numberFormat(options?: {
    locale?: string | Expression | ExpressionSpecification;
    currency?: string | Expression | ExpressionSpecification;
    'min-fraction-digits'?: number | Expression | ExpressionSpecification;
    'max-fraction-digits'?: number | Expression | ExpressionSpecification;
  }): Expression {
    const args: any[] = ['number-format', this.build()];
    if (options) {
      const formatOptions: any = {};
      if (options.locale !== undefined) {
        formatOptions.locale = options.locale instanceof Expression ? options.locale.build() : options.locale;
      }
      if (options.currency !== undefined) {
        formatOptions.currency = options.currency instanceof Expression ? options.currency.build() : options.currency;
      }
      if (options['min-fraction-digits'] !== undefined) {
        formatOptions['min-fraction-digits'] =
          options['min-fraction-digits'] instanceof Expression
            ? options['min-fraction-digits'].build()
            : options['min-fraction-digits'];
      }
      if (options['max-fraction-digits'] !== undefined) {
        formatOptions['max-fraction-digits'] =
          options['max-fraction-digits'] instanceof Expression
            ? options['max-fraction-digits'].build()
            : options['max-fraction-digits'];
      }
      args.push(formatOptions);
    }
    return new Expression(args as ExpressionSpecification);
  }

  // String operations as chainable methods
  concat(...values: (string | Expression | ExpressionSpecification)[]): Expression {
    const args = ['concat', this.build(), ...values.map((v) => (v instanceof Expression ? v.build() : v))];
    return new Expression(args as ExpressionSpecification);
  }

  downcase(): Expression {
    return new Expression(['downcase', this.build()]);
  }

  upcase(): Expression {
    return new Expression(['upcase', this.build()]);
  }

  // Lookup operations as chainable methods
  length(): Expression {
    return new Expression(['length', this.build()]);
  }

  at(index: number | Expression | ExpressionSpecification): Expression {
    return new Expression(['at', index instanceof Expression ? index.build() : index, this.build()]);
  }

  slice(
    start: number | Expression | ExpressionSpecification,
    end?: number | Expression | ExpressionSpecification,
  ): Expression {
    const args: any[] = ['slice', this.build(), start instanceof Expression ? start.build() : start];
    if (end !== undefined) {
      args.push(end instanceof Expression ? end.build() : end);
    }
    return new Expression(args as ExpressionSpecification);
  }

  in(collection: string | Expression | ExpressionSpecification): Expression {
    return new Expression(['in', this.build(), collection instanceof Expression ? collection.build() : collection]);
  }

  indexOf(
    item: any | Expression | ExpressionSpecification,
    fromIndex?: number | Expression | ExpressionSpecification,
  ): Expression {
    const args: any[] = ['index-of', item instanceof Expression ? item.build() : item, this.build()];
    if (fromIndex !== undefined) {
      args.push(fromIndex instanceof Expression ? fromIndex.build() : fromIndex);
    }
    return new Expression(args as ExpressionSpecification);
  }

  // Interpolation as chainable method
  interpolate(
    interpolation: InterpolationSpecification,
    ...stops: (number | Expression | ExpressionSpecification | any)[]
  ): Expression {
    const args = ['interpolate', interpolation, this.build()];
    args.push(...stops.map((stop) => (stop instanceof Expression ? stop.build() : stop)));
    return new Expression(args as ExpressionSpecification);
  }

  // Step as chainable method
  step(
    min: number | Expression | ExpressionSpecification,
    ...stops: (number | Expression | ExpressionSpecification | any)[]
  ): Expression {
    const args = ['step', this.build(), min instanceof Expression ? min.build() : min];
    args.push(...stops.map((stop) => (stop instanceof Expression ? stop.build() : stop)));
    return new Expression(args as ExpressionSpecification);
  }

  // Type system expressions as chainable methods
  coalesce(...values: (Expression | ExpressionSpecification | any)[]): Expression {
    const args = ['coalesce', this.build(), ...values.map((v) => (v instanceof Expression ? v.build() : v))];
    return new Expression(args as ExpressionSpecification);
  }

  // Build the final expression
  build(): ExpressionSpecification {
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
export class Property<T> {
  private value: DataDrivenPropertyValueSpecification<T>;

  constructor(value: DataDrivenPropertyValueSpecification<T>) {
    this.value = value;
  }

  // Static factory methods
  static literal<T>(value: T): Property<T> {
    return new Property(value);
  }

  static expression<T>(expression: Expression): Property<T> {
    return new Property(expression.build() as DataDrivenPropertyValueSpecification<T>);
  }

  static cameraFunction<T>(fn: CameraFunctionSpecification<T>): Property<T> {
    return new Property(fn);
  }

  static sourceFunction<T>(fn: SourceFunctionSpecification<T>): Property<T> {
    return new Property(fn);
  }

  static compositeFunction<T>(fn: CompositeFunctionSpecification<T>): Property<T> {
    return new Property(fn);
  }

  // Chainable methods for expressions

  static interpolate<T>(
    interpolation: InterpolationSpecification,
    input: Expression,
    ...stops: (number | T | Expression)[]
  ): Property<T> {
    const expr = Expression.interpolate(interpolation, input, ...stops);
    return Property.expression(expr);
  }

  static step<T>(input: Expression, min: number | Expression, ...stops: (number | Expression)[]): Property<T> {
    const expr = Expression.step(input, min, ...stops);
    return Property.expression(expr);
  }

  build(): DataDrivenPropertyValueSpecification<T> {
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
  private layer: any = {};

  constructor(type: string, id: string, source: string, sourceLayer?: string) {
    this.layer = { id, type, source, ...(sourceLayer && { 'source-layer': sourceLayer }) };
  }

  // Layout properties (common across layer types)
  visibility(visibility: 'visible' | 'none'): this {
    if (!this.layer.layout) this.layer.layout = {};
    this.layer.layout.visibility = visibility;
    return this;
  }

  // Paint properties - Fill layer
  fillColor(color: DataDrivenPropertyValueSpecification<ColorSpecification>): this {
    if (!this.layer.paint) this.layer.paint = {};
    this.layer.paint['fill-color'] = color;
    return this;
  }

  fillOpacity(opacity: DataDrivenPropertyValueSpecification<number>): this {
    if (!this.layer.paint) this.layer.paint = {};
    this.layer.paint['fill-opacity'] = opacity;
    return this;
  }

  fillOutlineColor(color: DataDrivenPropertyValueSpecification<ColorSpecification>): this {
    if (!this.layer.paint) this.layer.paint = {};
    this.layer.paint['fill-outline-color'] = color;
    return this;
  }

  // Paint properties - Line layer
  lineColor(color: DataDrivenPropertyValueSpecification<ColorSpecification>): this {
    if (!this.layer.paint) this.layer.paint = {};
    this.layer.paint['line-color'] = color;
    return this;
  }

  lineWidth(width: DataDrivenPropertyValueSpecification<number>): this {
    if (!this.layer.paint) this.layer.paint = {};
    this.layer.paint['line-width'] = width;
    return this;
  }

  // Paint properties - Circle layer
  circleColor(color: DataDrivenPropertyValueSpecification<ColorSpecification>): this {
    if (!this.layer.paint) this.layer.paint = {};
    this.layer.paint['circle-color'] = color;
    return this;
  }

  circleRadius(radius: DataDrivenPropertyValueSpecification<number>): this {
    if (!this.layer.paint) this.layer.paint = {};
    this.layer.paint['circle-radius'] = radius;
    return this;
  }

  // Layout properties - Symbol layer
  textField(field: DataDrivenPropertyValueSpecification<string>): this {
    if (!this.layer.layout) this.layer.layout = {};
    this.layer.layout['text-field'] = field;
    return this;
  }

  textSize(size: DataDrivenPropertyValueSpecification<number>): this {
    if (!this.layer.layout) this.layer.layout = {};
    this.layer.layout['text-size'] = size;
    return this;
  }

  // Generic property setter for any paint/layout property
  setPaintProperty(key: string, value: any): this {
    if (!this.layer.paint) this.layer.paint = {};
    this.layer.paint[key] = value;
    return this;
  }

  setLayoutProperty(key: string, value: any): this {
    if (!this.layer.layout) this.layer.layout = {};
    this.layer.layout[key] = value;
    return this;
  }

  // Metadata and other properties
  metadata(metadata: any): this {
    this.layer.metadata = metadata;
    return this;
  }

  minZoom(zoom: number): this {
    this.layer['minzoom'] = zoom;
    return this;
  }

  maxZoom(zoom: number): this {
    this.layer['maxzoom'] = zoom;
    return this;
  }

  filter(filter: ExpressionSpecification): this {
    this.layer.filter = filter;
    return this;
  }

  build() {
    return this.layer;
  }
}
