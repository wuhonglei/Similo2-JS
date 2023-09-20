/**
 * Main class, containing the Algorithm.
 *
 * @remarks For more information on how the algorithm works, please refer to:
 * Maurizio Leotta, Andrea Stocco, Filippo Ricca, Paolo Tonella. ROBULA+:
 * An Algorithm for Generating Robust XPath Locators for Web Testing. Journal
 * of Software: Evolution and Process (JSEP), Volume 28, Issue 3, pp.177–204.
 * John Wiley & Sons, 2016.
 * https://doi.org/10.1002/smr.1771
 *
 * @param options - (optional) algorithm options.
 */
export declare class RobulaPlus {
    private attributePriorizationList;
    private attributeBlackList;
    constructor(options?: RobulaPlusOptions);
    /**
     * Returns an optimized robust XPath locator string.
     *
     * @param element - The desired element.
     * @param document - The document to analyse, that contains the desired element.
     *
     * @returns - A robust xPath locator string, describing the desired element.
     */
    getRobustXPath(element: Element, document: Document): string;
    /**
     * Returns an element in the given document located by the given xPath locator.
     *
     * @param xPath - A xPath string, describing the desired element.
     * @param document - The document to analyse, that contains the desired element.
     *
     * @returns - The first maching Element located.
     */
    getElementByXPath(xPath: string, document: Document): Element;
    /**
     * Returns, wheater an xPath describes only the given element.
     *
     * @param xPath - A xPath string, describing the desired element.
     * @param element - The desired element.
     * @param document - The document to analyse, that contains the desired element.
     *
     * @returns - True, if the xPath describes only the desired element.
     */
    uniquelyLocate(xPath: string, element: Element, document: Document): boolean;
    transfConvertStar(xPath: XPath, element: Element): XPath[];
    transfAddId(xPath: XPath, element: Element): XPath[];
    transfAddText(xPath: XPath, element: Element): XPath[];
    transfAddAttribute(xPath: XPath, element: Element): XPath[];
    transfAddAttributeSet(xPath: XPath, element: Element): XPath[];
    transfAddPosition(xPath: XPath, element: Element): XPath[];
    transfAddLevel(xPath: XPath, element: Element): XPath[];
    private generatePowerSet;
    private elementCompareFunction;
    private getAncestor;
    private getAncestorCount;
}
export declare class XPath {
    private value;
    constructor(value: string);
    getValue(): string;
    startsWith(value: string): boolean;
    substring(value: number): string;
    headHasAnyPredicates(): boolean;
    headHasPositionPredicate(): boolean;
    headHasTextPredicate(): boolean;
    addPredicateToHead(predicate: string): void;
    getLength(): number;
}
export declare class RobulaPlusOptions {
    /**
     * @attribute - attributePriorizationList: A prioritized list of HTML attributes, which are considered in the given order.
     * @attribute - attributeBlackList: Contains HTML attributes, which are classified as too fragile and are ignored by the algorithm.
     */
    attributePriorizationList: string[];
    attributeBlackList: string[];
}
export declare const getElementByXPath: any;
export declare const getRobustXPath: any;
