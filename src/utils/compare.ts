/**
 * 属性值比较
 */

import { intersection, isEmpty, isNil, isString, stripString, toPrecision, union } from '.';
import { Point } from '../interface';
import { tagGroupList } from '../constant';

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
  if (isEmpty(a) || isEmpty(b)) {
    return 0;
  }

  if (String(a).toLowerCase() === String(b).toLowerCase()) {
    return 1;
  }

  return 0;
}

/**
 * 寻找标签分类索引
 * @param tag
 * @returns {number} -1 未找到, 否则返回索引
 */
function findTagGroupIndex(tag: string): number {
  tag = tag.toLowerCase();
  return tagGroupList.findIndex((tagGroup) => tagGroup.includes(tag));
}

/**
 * 比较 tag 标签的相似度
 * @param a
 * @param b
 */
export function tagSimilarity(a: string, b: string): number {
  if (isEmpty(a) || isEmpty(b)) {
    return 0;
  }

  a = String(a).toLowerCase();
  b = String(b).toLowerCase();
  if (a === b) {
    return 1;
  }

  const aIndex = findTagGroupIndex(a);
  const bIndex = findTagGroupIndex(b);
  if (aIndex === -1 || bIndex === -1) {
    return 0;
  }

  if (aIndex === bIndex) {
    return 0.5;
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
  if (isEmpty(newA) || isEmpty(newB)) {
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
 * 移除标点符号
 * 根据 4603 个可见元素文本数据集，统计出现频率最高的标点符号
 *
 * ... 例如 I'm shopping for...
 * ® 注册标识, 例如 Starbucks® Rewards Visa® Prepaid Card
 * ? 例如 stay?
 * ... 省略号, 例如 More...
 * ! 感叹号, 例如 Get it now!
 * ® 注册商标, 例如 Starbucks®
 * . 句号, 例如 back.
 * , 逗号, 例如 UP,
 * @param str
 */
function wordSanitize(str: string): string {
  return (str || '').replace(/(&|\?|\.\.\.|\!|®|©|[,.\/\-$]$)/g, '');
}

function worldListSanitize(wordList: string[]): string[] {
  return wordList.map((word) => (word || '').toLowerCase()).filter(Boolean);
}

/**
 * Jaccard(雅卡尔) 相似度, 比较文本集之间的相似度
 * 参考: https://www.wikiwand.com/zh/%E9%9B%85%E5%8D%A1%E5%B0%94%E6%8C%87%E6%95%B0
 * @param wordList1
 * @param wordList2
 */
function jaccardSimilarity(wordList1: string[], wordList2: string[]): number {
  if (isEmpty(wordList1) || isEmpty(wordList2)) {
    return 0;
  }

  return intersection(wordList1, wordList2).length / union(wordList1, wordList2).length;
}

/**
 * 单词相似度比较
 * 1. 数据清洗：去除空格、标点符号、换行符
 * 2. 相似度比较
 * @param wordList1
 * @param wordList2
 */
export function wordSimilarity(wordList1: string[], wordList2: string[]): number {
  const cleanWorldList1 = worldListSanitize(wordList1);
  const cleanWorldList2 = worldListSanitize(wordList2);
  const score = jaccardSimilarity(cleanWorldList1, cleanWorldList2);
  return toPrecision(score);
}

/**
 * class 名称分割
 * -- 分割, followus--text
 * - 分割, other-project-link
 * __ 分割, footer__module
 * _ 分割, sc_fjdhpX
 * () 分割, W(190px)
 * [] 分割 .example[data-v-f3f3eg9]
 * @param classname
 */
export function classSegment(classname: string): string[] {
  return classname.split(/(--|-|__|_|\[|\()/).filter(Boolean);
}

/**
 * 比较两个 classList 的相似度
 * @param classList1
 * @param classList2
 */
export function classListSimilarity(classList1: string[], classList2: string[]): number {
  if (isEmpty(classList1) || isEmpty(classList2)) {
    return 0;
  }
  const cleanClassList1 = classList1
    .map((classname) => classSegment(classname))
    .flat()
    .map((classname) => classname.toLowerCase());
  const cleanClassList2 = classList2
    .map((classname) => classSegment(classname))
    .flat()
    .map((classname) => classname.toLowerCase());

  const score = jaccardSimilarity(cleanClassList1, cleanClassList2);
  return toPrecision(score);
}

/**
 * xpath 相似度
 * 如果 XPath 末尾仅添加（或删除）一个元​​素可以使其与另一个 XPath 相匹配，则它们被认为是相似的
 * @param a
 * @param b
 */
export function xpathSimilarity(a: string, b: string): number {
  if (isEmpty(a) || isEmpty(b)) {
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
