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
 * 单词相似度比较
 * 1. 数据清洗：去除空格、标点符号、换行符
 * 2. 相似度比较
 * @param wordList1
 * @param wordList2
 */
export declare function wordSimilarity(wordList1: string[], wordList2: string[]): number;
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
export declare function classSegment(classname: string): string[];
/**
 * 比较两个 classList 的相似度
 * @param classList1
 * @param classList2
 */
export declare function classListSimilarity(classList1: string[], classList2: string[]): number;
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
