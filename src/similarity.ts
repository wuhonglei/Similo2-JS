/**
 * 计算属性相似度
 */

import { propertyConfigByName, propertyNames } from './config';
import type {
  MaxScoreDetail,
  Property,
  SimilarPropertyResult,
  SimilarScoreDetail,
  WeightByName,
} from './interface/property';
import { getValidPropertyNames, toPrecision } from './utils';

export function findPropertyByXpath(xpath: string, properties: Property[]): Property | undefined {
  return properties.find((p) => p.xpath === xpath);
}

export function findPropertyIndexByXpath(xpath: string, properties: Property[]): number {
  if (!Array.isArray(properties)) {
    properties = [properties];
  }

  return properties.findIndex((p) => p.xpath === xpath);
}

export function getSimilarScoreDetails(
  property1: Property,
  property2: Property,
  weightByName?: WeightByName,
): SimilarScoreDetail[] {
  const validPropertyNames = getValidPropertyNames(property1);
  const scoreDetails = validPropertyNames.map((name) => {
    const { weight, compare } = propertyConfigByName[name];
    const newWeight = weightByName?.[name] ?? weight;
    const value1 = property1[name];
    const value2 = property2[name];
    // @ts-ignore
    const similarity = compare(value1, value2);
    return {
      name,
      value: {
        target: value1,
        candidate: value2,
      },
      weight: newWeight,
      similarity,
      score: toPrecision(newWeight * similarity, 6),
    };
  });
  return scoreDetails.filter(Boolean);
}

function sumScore(scoreDetails: SimilarScoreDetail[]): number {
  return scoreDetails.reduce((acc, cur) => acc + cur.score, 0);
}

/**
 * 将分数转为 0-100 之间的数
 * @param scores
 * @param idealScore
 */
function normalizeScores(scores: number[], idealScore: number): number[] {
  return scores.map((score) => normalizeScore(score, idealScore));
}

/**
 * 将分数转为 0-100 之间的数
 * @param scores
 * @param idealScore
 */
function normalizeScore(score: number, idealScore: number): number {
  if (!idealScore) {
    return 0;
  }

  const normalized = (score * 100) / idealScore;
  return toPrecision(normalized, 6);
}

function getMaxScoreDetail(scoreDetailsList: SimilarScoreDetail[][]): MaxScoreDetail {
  const scores = scoreDetailsList.map((detail) => sumScore(detail));
  let index = -1;
  let max = -Infinity;
  scores.forEach((score, i) => {
    if (score > max) {
      max = score;
      index = i;
    }
  });

  return {
    max,
    index,
    scores,
  };
}

/**
 * 获取目标元素的理想分数(所有项都匹配)
 * @param property
 * @returns
 */
export function getIdealScore(property: Property, weightByName?: WeightByName): number {
  const scoreDetails = getSimilarScoreDetails(property, property, weightByName);
  return sumScore(scoreDetails);
}

/**
 * 根据元素属性，从候选元素中找到最相似的元素
 * @param property
 * @param properties
 */
export function findSimilarProperty(
  property: Property,
  properties: Property[],
  weightByName?: WeightByName,
): SimilarPropertyResult {
  const scoreDetailsList = properties.map((p) => getSimilarScoreDetails(property, p, weightByName));
  const idealScore = getIdealScore(property, weightByName);
  const { scores, max, index } = getMaxScoreDetail(scoreDetailsList);

  return {
    scores,
    maxScore: max,
    maxIndex: index,
    scoreDetails: scoreDetailsList,
    similarProperty: properties[index],
    normalizedMaxScore: normalizeScore(max, idealScore),
  };
}
