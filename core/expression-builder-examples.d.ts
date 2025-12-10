/**
 * Comprehensive Examples for MapLibre Expression Builder
 *
 * This file demonstrates all the capabilities of the new expression builder system.
 * These examples show how to replace manual expression arrays with type-safe builders.
 */
import { Expression, Property, Value, Layer } from './expression-builder';
/**
 * Basic property access expressions
 */
export declare const basicExpressions: {
    getId: Expression;
    hasId: Expression;
    zoom: Expression;
    literalString: Expression;
    literalNumber: Expression;
};
export declare const mathExpressions: {
    add: Expression;
    subtract: Expression;
    multiply: Expression;
    divide: Expression;
    modulo: Expression;
    power: Expression;
    pi: Expression;
    e: Expression;
    ln2: Expression;
    complex: Expression;
    complexChained: Expression;
    calculationChain: Expression;
    powerChain: Expression;
    moduloChain: Expression;
    sqrtChain: Expression;
    log10Chain: Expression;
};
export declare const comparisonExpressions: {
    idEqualsZero: Expression;
    zoomGreaterThan10: Expression;
    zoomLessThanOrEqual15: Expression;
    typeEqualsPolygon: Expression;
    idEqualsZeroChained: Expression;
    zoomGreaterThan10Chained: Expression;
    zoomLessThanOrEqual15Chained: Expression;
    typeEqualsPolygonChained: Expression;
    complexComparison: Expression;
    rangeCheck: Expression;
};
export declare const logicalExpressions: {
    hasIdAndVisible: Expression;
    isPolygonOrLine: Expression;
    notHidden: Expression;
    complexCondition: Expression;
};
export declare const matchExpressions: {
    objectBasedPalette: Expression;
};
export declare const conditionalExpressions: {
    simpleWhenThen: Expression;
    nestedWhenThen: Expression;
    complexWhenThen: Expression;
    multipleConditions: Expression;
    comparisonBased: Expression;
};
export declare const interpolationExpressions: {
    zoomBasedOpacity: Expression;
    exponentialSize: Expression;
    smoothColorTransition: Expression;
    labColorInterpolation: Expression;
};
export declare const stepExpressions: {
    zoomBasedLineWidth: Expression;
    magnitudeBasedRadius: Expression;
};
export declare const typeConversionExpressions: {
    idAsNumber: Expression;
    countAsString: Expression;
    visibleAsBoolean: Expression;
    colorValue: Expression;
    nameAsString: Expression;
    countAsNumber: Expression;
    visibleAsBooleanTyped: Expression;
    tagsAsArray: Expression;
    tagsAsStringArray: Expression;
    metadataAsObject: Expression;
    valueType: Expression;
    primaryColorOrDefault: Expression;
    nameOrPlaceholder: Expression;
    safeProcessing: Expression;
};
export declare const stringExpressions: {
    fullName: Expression;
    uppercase: Expression;
    lowercase: Expression;
};
export declare const lookupExpressions: {
    nameLength: Expression;
    tagsLength: Expression;
    hasImportantTag: Expression;
    containsLetterA: Expression;
    firstTag: Expression;
    firstNameChar: Expression;
    namePrefix: Expression;
    firstTwoTags: Expression;
    nameFromThirdChar: Expression;
    urgentTagIndex: Expression;
    letterPosition: Expression;
    searchFromIndex: Expression;
    conditionalSlice: Expression;
    tagBasedColor: Expression;
    processTags: Expression;
};
export declare const globalStateExpressions: {
    themeColor: Expression;
    userPreferences: Expression;
    appConfig: Expression;
    themeBasedColor: Expression;
    dynamicSize: Expression;
    categoryColor: Expression;
};
export declare const valueBuilders: {
    visibility: Value<"visible" | "none">;
    zoomBasedLineWidth: Value<unknown>;
    cameraBasedSize: Value<number>;
};
export declare const propertyBuilders: {
    fillColor: Property<string>;
    fillOpacity: Property<number>;
    circleRadius: Property<unknown>;
    lineWidth: Property<number>;
    textSize: Property<number>;
};
export declare const layerBuilders: {
    fillLayer: Layer;
    fillLayerConcise: Layer;
    fillLayerColorPalette: Layer;
    circleLayer: Layer;
    lineLayer: Layer;
    symbolLayer: Layer;
    filteredLayer: Layer;
};
export declare const advancedTypeExpressions: {
    collatorDefault: Expression;
    collatorCaseSensitive: Expression;
    collatorLocale: Expression;
    collatorFull: Expression;
    imageDynamic: Expression;
    imageLiteral: Expression;
    numberFormatDynamic: Expression;
    numberFormatLiteral: Expression;
    numberFormatPrecision: Expression;
    formatSimple: Expression;
    formatWithData: Expression;
    formatWithFormatting: Expression;
    formatComplex: Expression;
    formatWithFont: Expression;
};
export declare const directImportExamples: {
    ergonomicWhenThen: Expression;
    directGet: Expression;
    directHas: Expression;
    directZoom: Expression;
    directLiteral: Expression;
    chainedMath: Expression;
    sqrtExample: Expression;
    log10Example: Expression;
    directMatch: Expression;
    directComparison: Expression;
    directWhenThen: Expression;
    directInterpolate: Expression;
};
//# sourceMappingURL=expression-builder-examples.d.ts.map