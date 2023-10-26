/**
 * 文本采集
 */
import { ElementLocation, ElementPropertiesOption } from '../interface';
export declare function getElementLocation(element: Element): ElementLocation;
export declare function getVisibleText(element: Element): string[];
/**
 * 获取元素周围 50px 的文本
 * @param location 元素区域
 * @returns string
 */
export declare function getNeighborText(element: Element, location: ElementLocation, option: Partial<Pick<ElementPropertiesOption, 'excludeContainers'>>): string[];
