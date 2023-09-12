/**
 * 属性值比较
 */

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
 * 计算编辑距离
 * @param a
 * @param b
 */
function computeLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const aLen = a.length;
  const bLen = b.length;

  if (!aLen) {
    return bLen;
  }

  if (!bLen) {
    return aLen;
  }

  // 初始化矩阵
  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        const min = Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]);
        matrix[i][j] = min + 1;
      }
    }
  }

  return matrix[bLen][aLen];
}

/**
 * 交换两个字符串
 * @param a
 * @param b
 */
function swapStringByLength<T extends string>(a: T, b: T): { min: T; max: T } {
  if (a.length > b.length) {
    return {
      min: b,
      max: a,
    };
  }

  return {
    min: a,
    max: b,
  };
}

/**
 * 交换两个数组
 * @param a
 * @param b
 */
function swapArrayByLength<T>(a: T[], b: T[]): { min: T[]; max: T[] } {
  if (a.length > b.length) {
    return {
      min: b,
      max: a,
    };
  }

  return {
    min: a,
    max: b,
  };
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

  if (newA === newB) {
    return 1;
  }

  const maxLen = Math.max(newA.length, newB.length);
  const { min, max } = swapStringByLength(newA, newB);
  const distance = computeLevenshteinDistance(max, min);
  const score = (maxLen - distance) / maxLen;
  return toPrecision(score);
}

/**
 * xpath 相似度
 * 如果 XPath 末尾仅添加（或删除）一个元​​素可以使其与另一个 XPath 相匹配，则它们被认为是相似的
 * @param a
 * @param b
 */
export function xpathSimilarity(a: string, b: string): number {
  if (!a || !b) {
    return 0;
  }

  const aParts = a.split('/');
  const bParts = b.split('/');
  const { min, max } = swapArrayByLength(aParts, bParts);

  max.pop();
  if (max.join('/') === min.join('/')) {
    return 1;
  }

  return stringSimilarity(a, b);
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
  const invalid = [a.x, a.y, b.x, b.y].some(isNil);
  if (invalid) {
    return 0;
  }

  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);
  const distance = Math.max(100 - pixelDistance, 0) / 100;
  return toPrecision(distance);
}

/**
 * 整数相似度
 * @param a
 * @param b
 * @returns
 */
export function integerSimilarity(a: number, b: number): number {
  if (isNil(a) || isNil(b)) {
    return 0;
  }

  const distance = Math.abs(a - b);
  const max = Math.max(a, b);
  const score = (max - distance) / max;
  return toPrecision(score);
}
