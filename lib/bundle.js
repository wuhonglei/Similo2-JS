(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Silimon = {}));
})(this, (function (exports) { 'use strict';

    function elementIsVisible(element) {
        if (getComputedStyle(element).visibility === 'hidden' || element.getBoundingClientRect().height == 0) {
            return false;
        }
        return true;
    }
    function uniqElements(elements) {
        return [...elements].reduce((uniq, element) => {
            if (!uniq.some((storedElement) => storedElement.contains(element))) {
                uniq.push(element);
            }
            return uniq;
        }, []);
    }
    function getElementByXPath(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
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

    function getXPath(element) {
        const idx = (sib, name) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
        const segs = (elm) => !elm || elm.nodeType !== 1
            ? ['']
            : [
                ...segs(elm.parentNode),
                elm instanceof HTMLElement
                    ? `${elm.localName}[${idx(elm)}]`
                    : `*[local-name() = '${elm.localName}'][${idx(elm)}]`,
            ];
        return segs(element).join('/');
    }
    function getIdXPath(element) {
        const idx = (sib, name) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
        const segs = (elm) => !elm || elm.nodeType !== 1
            ? ['']
            : elm.id && document.getElementById(elm.id) === elm
                ? [`//*[@id='${elm.id}']`]
                : [
                    ...segs(elm.parentNode),
                    elm instanceof HTMLElement
                        ? `${elm.localName}[${idx(elm)}]`
                        : `*[local-name() = '${elm.localName}'][${idx(elm)}]`,
                ];
        return segs(element).join('/');
    }

    /**
     * 获取 element 的属性
     */
    /**
     * 获取元素 classList
     * @param element HTMLElement
     * @returns class 数组
     */
    function getElementClassList(element) {
        return Array.from(element.classList).filter((className) => !['undefined', 'null'].includes(className));
    }
    function isButtonElement(element) {
        if (!element) {
            return false;
        }
        const { tagName, className } = element;
        if (tagName === 'BUTTON') {
            return true;
        }
        if (tagName === 'A' && /btn|button/i.test(className || '')) {
            return true;
        }
        if (tagName === 'INPUT' && ['button', 'submit', 'reset'].includes(element.type)) {
            return true;
        }
        return false;
    }
    function getElementLocation(element) {
        const { left, top, width, height } = element.getBoundingClientRect();
        return {
            x: Math.floor(left),
            y: Math.floor(top),
            width: Math.floor(width),
            height: Math.floor(height),
        };
    }
    function getElementArea(location) {
        const { width, height } = location;
        return width * height;
    }
    function getElementShape(location) {
        const { width, height } = location;
        return Math.floor((width * 100) / height);
    }
    function getVisibleText(element) {
        // textContent 会获取到隐藏元素的文本，所以使用 innerText
        const text = ['innerText', 'value', 'placeholder'].map((name) => (element[name] || '').trim()).find(Boolean);
        return (text || '').split(/[\n\s]+/);
    }
    function getElementHeight(element) {
        return element.getBoundingClientRect().height;
    }
    /**
     * 判断是否是同一个元素
     * @param currentElement
     * @param element
     * @returns
     */
    function isValidNeighborElement(currentElement, element) {
        if (!currentElement) {
            return false;
        }
        if (currentElement === element) {
            return false;
        }
        if (currentElement.contains(element)) {
            return false;
        }
        if (getVisibleText(currentElement) === getVisibleText(element)) {
            return false;
        }
        return true;
    }
    /**
     * 获取元素周围 50px 的文本
     * @param location 元素区域
     * @returns string
     */
    function getNeighborText(element, location) {
        const { x, y, width, height } = location;
        /**
         * TODO: 元素区域过大时，不进行文本获取 (Why?)
         */
        if (height > 100 || width > 600) {
            return [];
        }
        /**
         * 元素周围区域(top,right,bottom,left)的起始和结束坐标
         */
        const areas = [
            [x - 50, y - 50, x + width + 50, y],
            [x + width, y, x + width + 50, y + height],
            [x - 50, y + height, x + width + 50, y + height + 50],
            [x - 50, y, x, y + height],
        ];
        const xStep = 20; // 每次移动的 x 距离, 这里假设含有可见文本的元素的最小宽度是 20
        const yStep = 10; // 每次移动的 y 距离, 这里假设含有可见文本的元素的最小高度是 10
        const neighborElements = [];
        areas.forEach((area) => {
            const [x1, y1, x2, y2] = area;
            for (let i = x1; i < x2; i += xStep) {
                for (let j = y1; j < y2; j += yStep) {
                    const pointElement = document.elementFromPoint(i, j);
                    isValidNeighborElement(pointElement, element) && neighborElements.push(pointElement);
                }
            }
        });
        // 获取元素周围的文本
        const textListByString = uniqElements(neighborElements
            // 过滤掉高度大于 100 的元素
            .filter((element) => getElementHeight(element) <= 100)).reduce((textMap, currentElement) => {
            const text = getVisibleText(currentElement); // 'src \n  上传打包后的内容'
            textMap[text.join(' ')] = text; // 使用 map 是为了解决元素周围的文本重复的问题
            return textMap;
        }, {});
        return Object.values(textListByString).flat().filter(Boolean); // 原始数据不进行去重
    }
    /**
     * 获取单个元素的属性定位参数
     * @param element
     * @returns
     */
    function getElementProperties(element) {
        if (!element) {
            console.warn('element is null');
            return {};
        }
        const tag = element.tagName;
        const classList = getElementClassList(element);
        const name = element.name;
        const id = element.id || '';
        const href = element.href || '';
        const alt = element.alt || '';
        const xpath = getXPath(element);
        const idxpath = getIdXPath(element);
        const isButton = isButtonElement(element);
        const location = getElementLocation(element);
        const area = getElementArea(location);
        const shape = getElementShape(location);
        const visibleText = getVisibleText(element);
        const neighborText = getNeighborText(element, location);
        return {
            tag,
            classList,
            name,
            id,
            href,
            alt,
            xpath,
            idxpath,
            isButton,
            location,
            area,
            shape,
            visibleText,
            neighborText,
        };
    }
    /**
     * 获取候选元素的属性定位参数
     * @param selector
     * @returns
     */
    function getCandidateElementsPropertiesBySelector(selector) {
        const elements = document.querySelectorAll(selector);
        return [...elements].filter((element) => elementIsVisible(element)).map((element) => getElementProperties(element));
    }
    function getElementPropertiesByXpath(xpath) {
        const element = getElementByXPath(xpath);
        return getElementProperties(element);
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
    /**
     * 移除标点符号
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
    function wordSanitize(str) {
        return (str || '').replace(/(&|\?|\.\.\.|\!|®|©|[,.\/\-$]$)/g, '');
    }
    function worldListSanitize(wordList) {
        return wordList.map((word) => wordSanitize(word).toLowerCase()).filter(Boolean);
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
    function normalizeScore(scores, idealScore) {
        return scores.map((score) => {
            if (!idealScore) {
                return 0;
            }
            const normalized = (score * 100) / idealScore;
            return toPrecision(normalized, 6);
        });
    }
    function getMaxScoreDetail(scoreDetailsList, idealScore) {
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
            normalizedScores: normalizeScore(scores, idealScore),
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
        const { scores, normalizedScores, max, index } = getMaxScoreDetail(scoreDetailsList, idealScore);
        return {
            scores,
            maxScore: max,
            maxIndex: index,
            normalizedScores,
            scoreDetails: scoreDetailsList,
            similarProperty: properties[index],
        };
    }

    exports.findPropertyByXpath = findPropertyByXpath;
    exports.findPropertyIndexByXpath = findPropertyIndexByXpath;
    exports.findSimilarProperty = findSimilarProperty;
    exports.getCandidateElementsPropertiesBySelector = getCandidateElementsPropertiesBySelector;
    exports.getElementProperties = getElementProperties;
    exports.getElementPropertiesByXpath = getElementPropertiesByXpath;
    exports.getIdealScore = getIdealScore;
    exports.getNeighborText = getNeighborText;
    exports.getSimilarScoreDetails = getSimilarScoreDetails;

}));
//# sourceMappingURL=bundle.js.map
