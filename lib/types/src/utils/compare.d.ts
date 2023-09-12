/**
 * 属性值比较
 */
import { Point } from '../interface';
export declare function equalSimilarity<T extends string | number | boolean>(a: T, b: T): number;
/**
 * 比较两个字符串是否相等，忽略大小写
 * @param a
 * @param b
 * @returns
 */
export declare function equalSimilarityCaseInsensitive(a: string, b: string): number;
/**
 * 比较字符串编辑距离
 * @param a
 * @param b
 * @returns
 */
export declare function stringSimilarity(a: string, b: string): number;
/**
 * xpath 相似度
 * 如果 XPath 末尾仅添加（或删除）一个元​​素可以使其与另一个 XPath 相匹配，则它们被认为是相似的
 * @param a
 * @param b
 */
export declare function xpathSimilarity(a: string, b: string): number;
/**
 * 坐标距离相似度
 * @param a
 * @param b
 * @returns
 */
export declare function pointSimilarity(a: Point, b: Point): number;
/**
 * 整数相似度
 * @param a
 * @param b
 * @returns
 */
export declare function integerSimilarity(a: number, b: number): number;
