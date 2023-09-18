/**
 * 计算属性相似度
 */

import { propertyConfigByName, propertyNames } from './config';
import type { MaxScoreDetail, Property, SimilarPropertyResult, SimilarScoreDetail } from './interface/property';
import { toPrecision } from './utils';

export function findPropertyByXpath(xpath: string, properties: Property[]): Property | undefined {
  return properties.find((p) => p.xpath === xpath);
}

export function findPropertyIndexByXpath(xpath: string, properties: Property[]): number {
  if (!Array.isArray(properties)) {
    properties = [properties];
  }

  return properties.findIndex((p) => p.xpath === xpath);
}

export function getSimilarScoreDetails(property1: Property, property2: Property): SimilarScoreDetail[] {
  const scoreDetails = propertyNames.map((name) => {
    const { weight, compare } = propertyConfigByName[name];
    const value1 = property1[name];
    const value2 = property2[name];
    // @ts-ignore
    const similarity = compare(value1, value2);
    if (similarity) {
      return {
        name,
        value: {
          target: value1,
          candidate: value2,
        },
        weight,
        similarity,
        score: toPrecision(weight * similarity, 6),
      };
    }
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
function normalizeScore(scores: number[], idealScore: number): number[] {
  return scores.map((score) => {
    if (!idealScore) {
      return 0;
    }

    const normalized = (score * 100) / idealScore;
    return toPrecision(normalized, 6);
  });
}

function getMaxScoreDetail(scoreDetailsList: SimilarScoreDetail[][], idealScore: number): MaxScoreDetail {
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
export function getIdealScore(property: Property): number {
  const scoreDetails = getSimilarScoreDetails(property, property);
  return sumScore(scoreDetails);
}

/**
 * 根据元素属性，从候选元素中找到最相似的元素
 * @param property
 * @param properties
 */
export function findSimilarProperty(property: Property, properties: Property[]): SimilarPropertyResult {
  const scoreDetailsList = properties.map((p) => getSimilarScoreDetails(property, p));
  const idealScore = getIdealScore(property);
  const { scores, max, index } = getMaxScoreDetail(scoreDetailsList, idealScore);

  return {
    scores,
    maxScore: max,
    maxIndex: index,
    scoreDetails: scoreDetailsList,
    similarProperty: properties[index],
  };
}
