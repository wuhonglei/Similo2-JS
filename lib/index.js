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

    // get selector path
    function getAusDomPath(target) {
        if (!target) {
            return null;
        }
        return getRelativeDomPath(target.ownerDocument, target, true);
    }
    const mapPathAttrs = {
        id: true,
        value: true,
        name: true,
        text: true,
        role: true,
        type: true,
        'data-id': true,
        'data-name': true,
        'data-type': true,
        'data-role': true,
        'data-value': true,
    };
    const arrPathAttrs = [
        {
            name: 'id',
            on: true,
        },
        {
            name: 'value',
            on: true,
        },
        {
            name: 'name',
            on: true,
        },
        {
            name: 'text',
            on: true,
        },
        {
            name: 'role',
            on: true,
        },
        {
            name: 'type',
            on: true,
        },
        {
            name: 'data-id',
            on: true,
        },
        {
            name: 'data-name',
            on: true,
        },
        {
            name: 'data-type',
            on: true,
        },
        {
            name: 'data-role',
            on: true,
        },
        {
            name: 'data-value',
            on: true,
        },
    ];
    const reTextValueBlack = /(^\s+$|\n)/;
    function checkUniqueXPath(relativeNode, path, isAllDom = true) {
        try {
            const result = document.evaluate(path, relativeNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength === 1;
        }
        catch (e) {
            return false;
        }
    }
    function checkUniqueSelector(relativeNode, path, isAllDom = true) {
        try {
            const elements = relativeNode.querySelectorAll(path);
            return elements.length === 1;
        }
        catch (e) {
            return false;
        }
    }
    function getChildIndex(el) {
        let index = 0;
        let fixedIndex = 0;
        const { parentNode } = el;
        if (parentNode) {
            const { childNodes } = parentNode;
            for (let i = 0, len = childNodes.length; i < len; i++) {
                const node = childNodes[i];
                if (node.nodeType === 1) {
                    index++;
                    if (node === el) {
                        break;
                    }
                }
            }
        }
        return { index, fixedIndex };
    }
    // 读取最近的id唯一节点
    function getClosestIdNode(target, isAllDom) {
        let current = target;
        const { body } = target.ownerDocument;
        while (current !== null) {
            if (current.nodeName !== 'HTML') {
                const testidValue = current.getAttribute && current.getAttribute('data-testid');
                const idValue = current.getAttribute && current.getAttribute('id');
                if (testidValue && checkUniqueSelector(body, `[data-testid="${testidValue}"]`, isAllDom)) {
                    return {
                        node: current,
                        path: `[data-testid="${testidValue}"]`,
                    };
                }
                if (idValue && checkUniqueSelector(body, `#${idValue}`, isAllDom)) {
                    return {
                        node: current,
                        path: `#${idValue}`,
                    };
                }
                current = current.parentNode;
            }
            else {
                current = null;
            }
        }
        return null;
    }
    // 获取节点 CSS 选择器
    function getSelectorElement(target, rootNode, relativePath, childPath, isAllDom) {
        const tagName = target.nodeName.toLowerCase();
        let elementPath = tagName;
        let tempPath;
        // 校验tagName是否能唯一定位
        tempPath = elementPath + (childPath ? ` > ${childPath}` : '');
        if (checkUniqueSelector(rootNode, relativePath + tempPath, isAllDom)) {
            return `!${tempPath}`;
        }
        // 校验class能否定位
        let relativeClass = null;
        const classValue = target?.getAttribute('class') || '';
        const cacheClassNameList = [];
        const validClassNameList = classValue.split(/\s+/);
        for (let index = 0, len = validClassNameList.length; index < len; index++) {
            const className = validClassNameList[index];
            cacheClassNameList.push(className);
            const unionClassName = cacheClassNameList.join('.');
            tempPath = `${elementPath}.${unionClassName}${childPath ? ` > ${childPath}` : ''}`;
            if (checkUniqueSelector(rootNode, relativePath + tempPath, isAllDom)) {
                return `!${tempPath}`;
            }
            // 无法绝对定位,再次测试是否可以在父节点中相对定位自身
            const parent = target.parentNode;
            if (parent) {
                const element = parent.querySelectorAll(`:scope > .${unionClassName}`);
                if (element.length === 1) {
                    relativeClass = unionClassName;
                }
            }
        }
        // 校验属性是否能定位
        const validAttrList = arrPathAttrs.filter((attr) => attr.on);
        for (let index = 0, len = validAttrList.length; index < len; index++) {
            const attrName = validAttrList[index].name;
            const attrValue = target.getAttribute && target.getAttribute(attrName);
            if (attrValue) {
                elementPath += `[${attrName}="${attrValue}"]`;
                tempPath = elementPath + (childPath ? ` > ${childPath}` : '');
                if (checkUniqueSelector(rootNode, relativePath + tempPath, isAllDom)) {
                    return `!${tempPath}`;
                }
            }
        }
        let fixedElementPath = elementPath;
        // 父元素定位
        if (relativeClass) {
            elementPath += `.${relativeClass}`;
            fixedElementPath = elementPath;
        }
        else {
            const { index, fixedIndex } = getChildIndex(target);
            if (index >= 1) {
                fixedElementPath += `:nth-child(${fixedIndex})`;
                elementPath += `:nth-child(${index})`;
            }
        }
        tempPath = elementPath + (childPath ? ` > ${childPath}` : '');
        if (checkUniqueSelector(rootNode, relativePath + tempPath, isAllDom)) {
            tempPath = fixedElementPath + (childPath ? ` > ${childPath}` : '');
            return `!${tempPath}`;
        }
        return tempPath;
    }
    function getRelativeDomPath(rootNode, target, isAllDom) {
        let relativePath = '';
        let childPath = '';
        const tagName = target.nodeName.toLowerCase();
        let tempPath;
        const testidValue = target.getAttribute && mapPathAttrs.id && target.getAttribute('data-testid');
        const idValue = target.getAttribute && target.getAttribute('id');
        const textValue = target.childNodes.length === 1 && target.firstChild.nodeType === 3 && target.textContent;
        const nameValue = target.getAttribute && target.getAttribute('name');
        const typeValue = target.getAttribute && target.getAttribute('type');
        const valueValue = target.getAttribute && target.getAttribute('value');
        const tempTestPath = `[data-testid="${testidValue}"]`;
        const tempIdPath = `#${idValue}`;
        const tempTextPath = `//${tagName}[text()="${textValue}"]`;
        if (textValue &&
            !reTextValueBlack.test(textValue) &&
            textValue.length <= 50 &&
            checkUniqueXPath(rootNode, tempTextPath, isAllDom)) {
            // text定位
            return tempTextPath;
        }
        // 检查目标元素自身是否有唯一id
        if (idValue && checkUniqueSelector(rootNode, tempIdPath, isAllDom)) {
            // id定位
            return tempIdPath;
        }
        if (testidValue && checkUniqueSelector(rootNode, tempTestPath)) {
            return tempTestPath;
        }
        if (tagName === 'input') {
            // 表单项特殊校验
            tempPath = nameValue ? `${tagName}[name="${nameValue}"]` : tagName;
            if (valueValue) {
                switch (typeValue) {
                    case 'radio':
                    case 'checkbox':
                        tempPath += `[value="${valueValue}"]`;
                        break;
                }
            }
            tempPath += childPath ? ` > ${childPath}` : '';
            if (checkUniqueSelector(rootNode, tempPath, isAllDom)) {
                return tempPath;
            }
        }
        else if (nameValue) {
            // 非input，但有name值
            tempPath = `${tagName}[name="${nameValue}"]`;
            if (tempPath && checkUniqueSelector(rootNode, tempPath, isAllDom)) {
                return tempPath;
            }
        }
        else {
            // 检查目标是否有父容器有唯一id
            const idNodeInfo = getClosestIdNode(target, isAllDom);
            if (idNodeInfo) {
                relativePath = `${idNodeInfo.path} `;
            }
        }
        let current = target;
        childPath = '';
        while (current !== null) {
            if (current !== rootNode) {
                childPath = getSelectorElement(current, rootNode, relativePath, childPath, isAllDom);
                if (childPath.substring(0, 1) === '!') {
                    return relativePath + childPath.substring(1);
                }
                current = current.parentNode;
            }
            else {
                current = null;
            }
        }
        return null;
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var lib = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Main class, containing the Algorithm.
     *
     * @remarks For more information on how the algorithm works, please refer to:
     * Maurizio Leotta, Andrea Stocco, Filippo Ricca, Paolo Tonella. ROBULA+:
     * An Algorithm for Generating Robust XPath Locators for Web Testing. Journal
     * of Software: Evolution and Process (JSEP), Volume 28, Issue 3, pp.177–204.
     * John Wiley & Sons, 2016.
     * https://doi.org/10.1002/smr.1771
     *
     * @param options - (optional) algorithm options.
     */
    class RobulaPlus {
        constructor(options) {
            this.attributePriorizationList = ['name', 'class', 'title', 'alt', 'value'];
            this.attributeBlackList = [
                'href',
                'src',
                'onclick',
                'onload',
                'tabindex',
                'width',
                'height',
                'style',
                'size',
                'maxlength',
            ];
            if (options) {
                this.attributePriorizationList = options.attributePriorizationList;
                this.attributeBlackList = options.attributeBlackList;
            }
        }
        /**
         * Returns an optimized robust XPath locator string.
         *
         * @param element - The desired element.
         * @param document - The document to analyse, that contains the desired element.
         *
         * @returns - A robust xPath locator string, describing the desired element.
         */
        getRobustXPath(element, document) {
            if (!document.body.contains(element)) {
                throw new Error('Document does not contain given element!');
            }
            const xPathList = [new XPath('//*')];
            while (xPathList.length > 0) {
                const xPath = xPathList.shift();
                let temp = [];
                temp = temp.concat(this.transfConvertStar(xPath, element));
                temp = temp.concat(this.transfAddId(xPath, element));
                temp = temp.concat(this.transfAddText(xPath, element));
                temp = temp.concat(this.transfAddAttribute(xPath, element));
                temp = temp.concat(this.transfAddAttributeSet(xPath, element));
                temp = temp.concat(this.transfAddPosition(xPath, element));
                temp = temp.concat(this.transfAddLevel(xPath, element));
                temp = [...new Set(temp)]; // removes duplicates
                for (const x of temp) {
                    if (this.uniquelyLocate(x.getValue(), element, document)) {
                        return x.getValue();
                    }
                    xPathList.push(x);
                }
            }
            throw new Error('Internal Error: xPathList.shift returns undefined');
        }
        /**
         * Returns an element in the given document located by the given xPath locator.
         *
         * @param xPath - A xPath string, describing the desired element.
         * @param document - The document to analyse, that contains the desired element.
         *
         * @returns - The first maching Element located.
         */
        getElementByXPath(xPath, document) {
            return document.evaluate(xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue;
        }
        /**
         * Returns, wheater an xPath describes only the given element.
         *
         * @param xPath - A xPath string, describing the desired element.
         * @param element - The desired element.
         * @param document - The document to analyse, that contains the desired element.
         *
         * @returns - True, if the xPath describes only the desired element.
         */
        uniquelyLocate(xPath, element, document) {
            const nodesSnapshot = document.evaluate(xPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return nodesSnapshot.snapshotLength === 1 && nodesSnapshot.snapshotItem(0) === element;
        }
        transfConvertStar(xPath, element) {
            const output = [];
            const ancestor = this.getAncestor(element, xPath.getLength() - 1);
            if (xPath.startsWith('//*')) {
                output.push(new XPath('//' + ancestor.tagName.toLowerCase() + xPath.substring(3)));
            }
            return output;
        }
        transfAddId(xPath, element) {
            const output = [];
            const ancestor = this.getAncestor(element, xPath.getLength() - 1);
            if (ancestor.id && !xPath.headHasAnyPredicates()) {
                const newXPath = new XPath(xPath.getValue());
                newXPath.addPredicateToHead(`[@id='${ancestor.id}']`);
                output.push(newXPath);
            }
            return output;
        }
        transfAddText(xPath, element) {
            const output = [];
            const ancestor = this.getAncestor(element, xPath.getLength() - 1);
            if (ancestor.textContent && !xPath.headHasPositionPredicate() && !xPath.headHasTextPredicate()) {
                const newXPath = new XPath(xPath.getValue());
                newXPath.addPredicateToHead(`[contains(text(),'${ancestor.textContent}')]`);
                output.push(newXPath);
            }
            return output;
        }
        transfAddAttribute(xPath, element) {
            const output = [];
            const ancestor = this.getAncestor(element, xPath.getLength() - 1);
            if (!xPath.headHasAnyPredicates()) {
                // add priority attributes to output
                for (const priorityAttribute of this.attributePriorizationList) {
                    for (const attribute of ancestor.attributes) {
                        if (attribute.name === priorityAttribute) {
                            const newXPath = new XPath(xPath.getValue());
                            newXPath.addPredicateToHead(`[@${attribute.name}='${attribute.value}']`);
                            output.push(newXPath);
                            break;
                        }
                    }
                }
                // append all other non-blacklist attributes to output
                for (const attribute of ancestor.attributes) {
                    if (!this.attributeBlackList.includes(attribute.name) &&
                        !this.attributePriorizationList.includes(attribute.name)) {
                        const newXPath = new XPath(xPath.getValue());
                        newXPath.addPredicateToHead(`[@${attribute.name}='${attribute.value}']`);
                        output.push(newXPath);
                    }
                }
            }
            return output;
        }
        transfAddAttributeSet(xPath, element) {
            const output = [];
            const ancestor = this.getAncestor(element, xPath.getLength() - 1);
            if (!xPath.headHasAnyPredicates()) {
                // add id to attributePriorizationList
                this.attributePriorizationList.unshift('id');
                let attributes = [...ancestor.attributes];
                // remove black list attributes
                attributes = attributes.filter(attribute => !this.attributeBlackList.includes(attribute.name));
                // generate power set
                let attributePowerSet = this.generatePowerSet(attributes);
                // remove sets with cardinality < 2
                attributePowerSet = attributePowerSet.filter(attributeSet => attributeSet.length >= 2);
                // sort elements inside each powerset
                for (const attributeSet of attributePowerSet) {
                    attributeSet.sort(this.elementCompareFunction.bind(this));
                }
                // sort attributePowerSet
                attributePowerSet.sort((set1, set2) => {
                    if (set1.length < set2.length) {
                        return -1;
                    }
                    if (set1.length > set2.length) {
                        return 1;
                    }
                    for (let i = 0; i < set1.length; i++) {
                        if (set1[i] !== set2[i]) {
                            return this.elementCompareFunction(set1[i], set2[i]);
                        }
                    }
                    return 0;
                });
                // remove id from attributePriorizationList
                this.attributePriorizationList.shift();
                // convert to predicate
                for (const attributeSet of attributePowerSet) {
                    let predicate = `[@${attributeSet[0].name}='${attributeSet[0].value}'`;
                    for (let i = 1; i < attributeSet.length; i++) {
                        predicate += ` and @${attributeSet[i].name}='${attributeSet[i].value}'`;
                    }
                    predicate += ']';
                    const newXPath = new XPath(xPath.getValue());
                    newXPath.addPredicateToHead(predicate);
                    output.push(newXPath);
                }
            }
            return output;
        }
        transfAddPosition(xPath, element) {
            const output = [];
            const ancestor = this.getAncestor(element, xPath.getLength() - 1);
            if (!xPath.headHasPositionPredicate()) {
                let position = 1;
                if (xPath.startsWith('//*')) {
                    position = Array.from(ancestor.parentNode.children).indexOf(ancestor) + 1;
                }
                else {
                    for (const child of ancestor.parentNode.children) {
                        if (ancestor === child) {
                            break;
                        }
                        if (ancestor.tagName === child.tagName) {
                            position++;
                        }
                    }
                }
                const newXPath = new XPath(xPath.getValue());
                newXPath.addPredicateToHead(`[${position}]`);
                output.push(newXPath);
            }
            return output;
        }
        transfAddLevel(xPath, element) {
            const output = [];
            if (xPath.getLength() - 1 < this.getAncestorCount(element)) {
                output.push(new XPath('//*' + xPath.substring(1)));
            }
            return output;
        }
        generatePowerSet(input) {
            return input.reduce((subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])), [[]]);
        }
        elementCompareFunction(attr1, attr2) {
            for (const element of this.attributePriorizationList) {
                if (element === attr1.name) {
                    return -1;
                }
                if (element === attr2.name) {
                    return 1;
                }
            }
            return 0;
        }
        getAncestor(element, index) {
            let output = element;
            for (let i = 0; i < index; i++) {
                output = output.parentElement;
            }
            return output;
        }
        getAncestorCount(element) {
            let count = 0;
            while (element.parentElement) {
                element = element.parentElement;
                count++;
            }
            return count;
        }
    }
    exports.RobulaPlus = RobulaPlus;
    class XPath {
        constructor(value) {
            this.value = value;
        }
        getValue() {
            return this.value;
        }
        startsWith(value) {
            return this.value.startsWith(value);
        }
        substring(value) {
            return this.value.substring(value);
        }
        headHasAnyPredicates() {
            return this.value.split('/')[2].includes('[');
        }
        headHasPositionPredicate() {
            const splitXPath = this.value.split('/');
            const regExp = new RegExp('[[0-9]]');
            return splitXPath[2].includes('position()') || splitXPath[2].includes('last()') || regExp.test(splitXPath[2]);
        }
        headHasTextPredicate() {
            return this.value.split('/')[2].includes('text()');
        }
        addPredicateToHead(predicate) {
            const splitXPath = this.value.split('/');
            splitXPath[2] += predicate;
            this.value = splitXPath.join('/');
        }
        getLength() {
            const splitXPath = this.value.split('/');
            let length = 0;
            for (const piece of splitXPath) {
                if (piece) {
                    length++;
                }
            }
            return length;
        }
    }
    exports.XPath = XPath;
    class RobulaPlusOptions {
        constructor() {
            /**
             * @attribute - attributePriorizationList: A prioritized list of HTML attributes, which are considered in the given order.
             * @attribute - attributeBlackList: Contains HTML attributes, which are classified as too fragile and are ignored by the algorithm.
             */
            this.attributePriorizationList = ['name', 'class', 'title', 'alt', 'value'];
            this.attributeBlackList = [
                'href',
                'src',
                'onclick',
                'onload',
                'tabindex',
                'width',
                'height',
                'style',
                'size',
                'maxlength',
            ];
        }
    }
    exports.RobulaPlusOptions = RobulaPlusOptions;
    });

    unwrapExports(lib);
    var lib_1 = lib.RobulaPlus;
    lib.XPath;
    lib.RobulaPlusOptions;

    const robulaPlus = new lib_1();
    robulaPlus.getElementByXPath.bind(robulaPlus);
    const getRobustXPath = robulaPlus.getRobustXPath.bind(robulaPlus);

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
     * 判断是否是有效的邻居节点
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
        getIdealScore(property);
        const { scores, max, index } = getMaxScoreDetail(scoreDetailsList);
        return {
            scores,
            maxScore: max,
            maxIndex: index,
            scoreDetails: scoreDetailsList,
            similarProperty: properties[index],
        };
    }

    exports.findPropertyByXpath = findPropertyByXpath;
    exports.findPropertyIndexByXpath = findPropertyIndexByXpath;
    exports.findSimilarProperty = findSimilarProperty;
    exports.getAusDomPath = getAusDomPath;
    exports.getCandidateElementsPropertiesBySelector = getCandidateElementsPropertiesBySelector;
    exports.getElementByXPath = getElementByXPath;
    exports.getElementProperties = getElementProperties;
    exports.getElementPropertiesByXpath = getElementPropertiesByXpath;
    exports.getIdealScore = getIdealScore;
    exports.getNeighborText = getNeighborText;
    exports.getRobustXPath = getRobustXPath;
    exports.getSimilarScoreDetails = getSimilarScoreDetails;

}));
//# sourceMappingURL=index.js.map
