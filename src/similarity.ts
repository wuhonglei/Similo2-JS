/**
 * 计算属性相似度
 */

import { propertyConfigByName, propertyNames } from './config';
import type { Property } from './interface/property';

export function getSimilarScore(property1: Property, property2: Property): number {
  let score = 0;
  propertyNames.forEach((name) => {
    const { weight, compare } = propertyConfigByName[name];
    // @ts-ignore
    const similarity = compare(property1[name], property2[name]);
    score += weight * similarity;
  });
  return score;
}

/**
 * 根据元素属性，从候选元素中找到最相似的元素
 * @param property
 * @param properties
 */
export function findSimilarProperty(property: Property, properties: Property[]): Property {
  const scores = properties.map((p) => getSimilarScore(property, p));
  const maxScore = Math.max(...scores);
  const maxIndex = scores.findIndex((score) => score === maxScore);
  return properties[maxIndex];
}

export function findPropertyByXpath(xpath: string, properties: Property[]): Property | undefined {
  return properties.find((p) => p.xpath === xpath);
}
