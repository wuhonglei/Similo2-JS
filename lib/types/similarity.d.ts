/**
 * 计算属性相似度
 */
import type { Property, SimilarPropertyResult, SimilarScoreDetail } from './interface/property';
export declare function findPropertyByXpath(xpath: string, properties: Property[]): Property | undefined;
export declare function findPropertyIndexByXpath(xpath: string, properties: Property[]): number;
export declare function getSimilarScoreDetails(property1: Property, property2: Property): SimilarScoreDetail[];
/**
 * 获取目标元素的理想分数(所有项都匹配)
 * @param property
 * @returns
 */
export declare function getIdealScore(property: Property): number;
/**
 * 根据元素属性，从候选元素中找到最相似的元素
 * @param property
 * @param properties
 */
export declare function findSimilarProperty(property: Property, properties: Property[]): SimilarPropertyResult;
