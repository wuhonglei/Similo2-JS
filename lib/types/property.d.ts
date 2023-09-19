/**
 * 获取 element 的属性
 */
import type { Property, ElementLocation, CandidateOption } from './interface/property';
export { getElementByXPath } from './utils/index';
export { getIdXPath, getXPath } from './utils/locator';
export { elementIsVisible } from './utils/index';
/**
 * 获取元素周围 50px 的文本
 * @param location 元素区域
 * @returns string
 */
export declare function getNeighborText(element: Element, location: ElementLocation): string[];
/**
 * 获取单个元素的属性定位参数
 * @param element
 * @returns
 */
export declare function getElementProperties(element: Element): Property;
/**
 * 获取候选元素的属性定位参数
 * @param selector
 * @returns
 */
export declare function getCandidateElementsPropertiesBySelector(selector: Parameters<ParentNode['querySelectorAll']>[0], option?: CandidateOption): Property[];
export declare function getElementPropertiesByXpath(xpath: string): Property;
