(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Similo = {}));
})(this, (function (exports) { 'use strict';

    function toPrecision(num, precision = 6) {
        return Number(num.toFixed(precision));
    }
    /**
     * 移除非法字段，仅保留字母和数字
     * @param str
     * @returns
     */
    function stripString(str) {
        return (str || '').replace(/[^a-zA-Z0-9]/g, '');
    }
    function isString(value) {
        return typeof value === 'string';
    }
    function isNil(value) {
        return value === null || value === undefined;
    }
    function isArray(value) {
        return Array.isArray(value);
    }
    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }
    function isNumber(value) {
        return typeof value === 'number';
    }
    function isEmpty(value) {
        if (isNil(value)) {
            return true;
        }
        if (isString(value) && !value.length) {
            return true;
        }
        if (isArray(value) && !value.length) {
            return true;
        }
        if (isPlainObject(value) && !Object.keys(value).length) {
            return true;
        }
        if (isNumber(value) && value === 0) {
            return true;
        }
        return false;
    }
    /**
     * 获取数组交集
     * @param a
     * @param b
     */
    function intersection(a, b) {
        return [...new Set(a.filter((item) => b.includes(item)))];
    }
    /**
     * 获取数组并集
     * @param a
     * @param b
     * @returns
     */
    function union(a, b) {
        return [...new Set([...a, ...b])];
    }

    /**
     * 属性值比较
     */
    function equalSimilarity(a, b) {
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
    function equalSimilarityCaseInsensitive(a, b) {
        if (isEmpty(a) || isEmpty(b)) {
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
    function computeLevenshteinDistance(a, b) {
        const matrix = [];
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
                }
                else {
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
    function swapStringByLength(a, b) {
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
    function swapArrayByLength(a, b) {
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
    function stringSimilarity(a, b) {
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
    function worldListSanitize(wordList) {
        return wordList.map((word) => (word || '').toLowerCase()).filter(Boolean);
    }
    /**
     * Jaccard(雅卡尔) 相似度, 比较文本集之间的相似度
     * 参考: https://www.wikiwand.com/zh/%E9%9B%85%E5%8D%A1%E5%B0%94%E6%8C%87%E6%95%B0
     * @param wordList1
     * @param wordList2
     */
    function jaccardSimilarity(wordList1, wordList2) {
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
    function wordSimilarity(wordList1, wordList2) {
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
    function classSegment(classname) {
        return classname.split(/(--|-|__|_|\[|\()/).filter(Boolean);
    }
    /**
     * 比较两个 classList 的相似度
     * @param classList1
     * @param classList2
     */
    function classListSimilarity(classList1, classList2) {
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
    function xpathSimilarity(a, b) {
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
    function pointSimilarity(a, b) {
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
    function integerSimilarity(a, b) {
        if (isNil(a) || isNil(b)) {
            return 0;
        }
        const distance = Math.abs(a - b);
        const max = Math.max(a, b);
        const score = (max - distance) / max;
        return toPrecision(score);
    }

    // [0.52, 0.48, 0.48, 1, 0.57, 0.48, 0.57, 0.48, 0.48, 0.48, 0.48, 0.52, 0.39, 0.52];
    const propertyConfigByName = {
        tag: {
            weight: 1.5,
            compare: equalSimilarityCaseInsensitive,
        },
        name: {
            weight: 1.5,
            compare: equalSimilarityCaseInsensitive,
        },
        id: {
            weight: 1.5,
            compare: equalSimilarityCaseInsensitive,
        },
        visibleText: {
            weight: 1.5,
            compare: wordSimilarity,
        },
        neighborText: {
            weight: 1.5,
            compare: wordSimilarity,
        },
        classList: {
            weight: 0.5,
            compare: classListSimilarity,
        },
        href: {
            weight: 0.5,
            compare: stringSimilarity,
        },
        alt: {
            weight: 0.5,
            compare: stringSimilarity,
        },
        xpath: {
            weight: 0.5,
            compare: xpathSimilarity,
        },
        idxpath: {
            weight: 0.5,
            compare: xpathSimilarity,
        },
        isButton: {
            weight: 0.5,
            compare: equalSimilarity,
        },
        location: {
            weight: 0.5,
            compare: pointSimilarity,
        },
        area: {
            weight: 0.5,
            compare: integerSimilarity,
        },
        shape: {
            weight: 0.5,
            compare: integerSimilarity,
        },
    };
    const propertyNames = Object.keys(propertyConfigByName);

    /**
     * 计算属性相似度
     */
    function findPropertyByXpath(xpath, properties) {
        return properties.find((p) => p.xpath === xpath);
    }
    function findPropertyIndexByXpath(xpath, properties) {
        if (!Array.isArray(properties)) {
            properties = [properties];
        }
        return properties.findIndex((p) => p.xpath === xpath);
    }
    function getSimilarScoreDetails(property1, property2) {
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
    function sumScore(scoreDetails) {
        return scoreDetails.reduce((acc, cur) => acc + cur.score, 0);
    }
    /**
     * 将分数转为 0-100 之间的数
     * @param scores
     * @param idealScore
     */
    function normalizeScore(score, idealScore) {
        if (!idealScore) {
            return 0;
        }
        const normalized = (score * 100) / idealScore;
        return toPrecision(normalized, 6);
    }
    function getMaxScoreDetail(scoreDetailsList) {
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
    function getIdealScore(property) {
        const scoreDetails = getSimilarScoreDetails(property, property);
        return sumScore(scoreDetails);
    }
    /**
     * 根据元素属性，从候选元素中找到最相似的元素
     * @param property
     * @param properties
     */
    function findSimilarProperty(property, properties) {
        const scoreDetailsList = properties.map((p) => getSimilarScoreDetails(property, p));
        const idealScore = getIdealScore(property);
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

    exports.findPropertyByXpath = findPropertyByXpath;
    exports.findPropertyIndexByXpath = findPropertyIndexByXpath;
    exports.findSimilarProperty = findSimilarProperty;
    exports.getIdealScore = getIdealScore;
    exports.getSimilarScoreDetails = getSimilarScoreDetails;

}));
//# sourceMappingURL=similarity.js.map
