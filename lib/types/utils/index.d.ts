import { ElementLocation, Point, Property, PropertyName } from '../interface';
export declare function elementIsVisible(element: Element): boolean;
export declare function uniq<T extends any>(arr: T[]): T[];
export declare function isBoolean(value: any): value is boolean;
export declare function uniqElements(elements: Element[]): Element[];
export declare function getElementByXPath(xpath: string): Element;
export declare function getElementByCssSelector(selector: string): Element;
export declare function getElementBySelector(selector: string): Element;
export declare function toPrecision(num: number, precision?: number): number;
/**
 * 移除非法字段，仅保留字母和数字
 * @param str
 * @returns
 */
export declare function stripString(str: string): string;
export declare function isString(value: any): value is string;
export declare function isNil(value: any): value is null | undefined;
export declare function isArray<T extends any>(value: T[]): value is T[];
export declare function isPlainObject(value: any): value is Record<string, any>;
export declare function isNumber(value: any): value is number;
export declare function isEmpty(value: any): boolean;
/**
 * 获取数组交集
 * @param a
 * @param b
 */
export declare function intersection<T extends any>(a: T[], b: T[]): T[];
/**
 * 获取数组并集
 * @param a
 * @param b
 * @returns
 */
export declare function union<T extends any>(a: T[], b: T[]): T[];
/**
 * 获取指定坐标的元素, 排除指定的元素
 * @param excludeContainers
 * @param point
 * @returns
 */
export declare function getOwnElement(excludeContainers: Element[], point: Point): Element;
/**
 * 根据选择器获取元素列表
 * @param selector
 */
export declare function getElementList(selectors: string[]): Element[];
/**
 * 获取指定 location 的元素
 * @param location
 * @returns
 */
export declare function getElementFromLocation(location: ElementLocation): Element | null;
/**
 * 获取有效属性值的属性名列表
 * @param properties
 * @returns
 */
export declare function getValidPropertyNames(properties: Partial<Property>): PropertyName[];
