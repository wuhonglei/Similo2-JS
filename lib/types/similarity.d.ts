/**
 * 计算属性相似度
 */
import type { Property } from './interface/property';
export declare function getSimilarScore(property1: Property, property2: Property): number;
/**
 * 根据元素属性，从候选元素中找到最相似的元素
 * @param property
 * @param properties
 */
export declare function findSimilarProperty(property: Property, properties: Property[]): Property;
export declare function findPropertyByXpath(xpath: string, properties: Property[]): Property | undefined;
