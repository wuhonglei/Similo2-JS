/**
 * 属性值比较
 */

import Levenshtein from 'levenshtein';
import { isEmpty, isNil, isString, stripString, toPrecision } from '.';
import { Point } from '../interface';

export function equalSimilarity<T extends string | number | boolean>(a: T, b: T): number {
  if (isNil(a) || isNil(b)) {
    return 0;
  }

  if (isString(a) && !a.length) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  return 0;
}

/**
 * 比较两个字符串是否相等，忽略大小写
 * @param a
 * @param b
 * @returns
 */
export function equalSimilarityCaseInsensitive(a: string, b: string): number {
  if (!a || !b) {
    return 0;
  }

  if (String(a).toLowerCase() === String(b).toLowerCase()) {
    return 1;
  }

  return 0;
}

/**
 * 比较字符串编辑距离
 * @param a
 * @param b
 * @returns
 */
export function stringSimilarity(a: string, b: string): number {
  const newA = stripString(a);
  const newB = stripString(b);
  if (!newA || !newB) {
    return 0;
  }

  const maxLen = Math.max(newA.length, newB.length);
  const { distance } = new Levenshtein(newA, newB);
  const score = (maxLen - distance) / maxLen;
  return toPrecision(score, 2);
}

/**
 * 坐标距离相似度
 * @param a
 * @param b
 * @returns
 */
export function pointSimilarity(a: Point, b: Point): number {
  if (isEmpty(a) || isEmpty(b)) {
    return 0;
  }
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);
  const distance = Math.max(100 - pixelDistance, 0) / 100;
  return toPrecision(distance, 2);
}

/**
 * 整数相似度
 * @param a
 * @param b
 * @returns
 */
export function integerSimilarity(a: number, b: number): number {
  const distance = Math.abs(a - b);
  const max = Math.max(a, b);
  const score = (max - distance) / max;
  return toPrecision(score, 2);
}
