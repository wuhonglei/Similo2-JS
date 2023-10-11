/**
 * 获取 element 的属性
 */
import type { Property, ElementLocation, CandidateOption, ElementPropertiesOption } from './interface/property';
export { getElementByXPath, getElementByCssSelector, getElementBySelector } from './utils/index';
export { getIdXPath, getXPath } from './utils/locator';
export { elementIsVisible } from './utils/index';
/**
 * 获取元素周围 50px 的文本
 * @param location 元素区域
 * @returns string
 */
export declare function getNeighborText(element: Element, location: ElementLocation, option: Partial<Pick<ElementPropertiesOption, 'excludeContainers'>>): string[];
/**
 * 获取单个元素的属性定位参数
 * @param element
 * @param option
 * @returns
 */
export declare function getElementProperties(element: Element, option?: Partial<ElementPropertiesOption>): Property;
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
export declare function getCandidateElementsPropertiesBySelector(selector: Parameters<ParentNode['querySelectorAll']>[0], option?: Partial<CandidateOption & ElementPropertiesOption>): Property[];
export declare function getElementPropertiesByXpath(xpath: string, option?: Partial<ElementPropertiesOption>): Property;
