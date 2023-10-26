/**
 * 获取 element 的属性
 */
import type { Property, CandidateOption, ElementPropertiesOption } from './interface/property';
export { getElementByXPath, getElementByCssSelector, getElementBySelector } from './utils/index';
export { getIdXPath, getXPath } from './utils/locator';
export { elementIsVisible } from './utils/index';
/**
 * 获取单个元素的属性定位参数
 * @param element
 * @param option
 * @returns
 */
export declare function getElementProperties(element: Element, option?: Partial<ElementPropertiesOption>): Partial<Property>;
/**
 * 获取候选元素的属性定位参数
 * @param tagList
 * @returns 返回逗号分隔的选择器, 例如 div,span,p
 */
export declare function getCommonSelector(tagList?: string[]): string;
/**
 * 获取候选元素的属性定位参数
 * @param selector
 * @returns
 */
export declare function getCandidateElementsPropertiesBySelector(selector: Parameters<ParentNode['querySelectorAll']>[0], option?: Partial<CandidateOption & ElementPropertiesOption>): Partial<Property>[];
export declare function getElementPropertiesByXpath(xpath: string, option?: Partial<ElementPropertiesOption>): Partial<Property>;
