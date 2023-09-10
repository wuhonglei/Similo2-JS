(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Silimon = {}));
})(this, (function (exports) { 'use strict';

    function getXPath(element) {
        const idx = (sib, name) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
        const segs = (elm) => !elm || elm.nodeType !== 1
            ? ['']
            : [
                ...segs(elm.parentNode),
                elm instanceof HTMLElement
                    ? `${elm.localName}[${idx(elm)}]`
                    : `*[local-name() = "${elm.localName}"][${idx(elm)}]`,
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
                        : `*[local-name() = "${elm.localName}"][${idx(elm)}]`,
                ];
        return segs(element).join('/');
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
        return text || '';
    }
    function getElementHeight(element) {
        return element.getBoundingClientRect().height;
    }
    /**
     * 判断是否是同一个元素
     * @param parentElement
     * @param element
     * @returns
     */
    function isSameElement(parentElement, element) {
        if (parentElement === element) {
            return true;
        }
        if (!parentElement.contains(element)) {
            return false;
        }
        const parentText = getVisibleText(parentElement);
        const elementText = getVisibleText(element);
        return parentText === elementText;
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
                    pointElement && !isSameElement(pointElement, element) && neighborElements.push(pointElement);
                }
            }
        });
        // 获取元素周围的文本
        const textListByString = uniqElements(neighborElements
            // 过滤掉高度大于 100 的元素
            .filter((element) => getElementHeight(element) <= 100)).reduce((textMap, currentElement) => {
            const text = getVisibleText(currentElement); // 'src \n  上传打包后的内容'
            textMap[text] = text.split(/[\n\s]+/); // 使用 map 是为了解决元素周围的文本重复的问题
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
        return [...elements].map((element) => getElementProperties(element));
    }
    function getElementPropertiesByXpath(xpath) {
        const element = getElementByXPath(xpath);
        return getElementProperties(element);
    }

    exports.getCandidateElementsPropertiesBySelector = getCandidateElementsPropertiesBySelector;
    exports.getElementProperties = getElementProperties;
    exports.getElementPropertiesByXpath = getElementPropertiesByXpath;
    exports.getIdXPath = getIdXPath;
    exports.getXPath = getXPath;

}));