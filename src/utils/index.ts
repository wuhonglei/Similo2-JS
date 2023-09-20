import { Point } from '../interface';

export function elementIsVisible(element: Element) {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  if (style.visibility === 'hidden' || style.display === 'none' || rect.height == 0 || rect.width == 0) {
    return false;
  }

  return true;
}

export function uniq<T extends any>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function uniqElements(elements: Element[]): Element[] {
  return [...elements].reduce((uniq, element) => {
    if (!uniq.some((storedElement) => storedElement.contains(element))) {
      uniq.push(element);
    }
    return uniq;
  }, [] as Element[]);
}

export function getElementByXPath(xpath: string): Element {
  return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as Element;
}

export function toPrecision(num: number, precision = 6): number {
  return Number(num.toFixed(precision));
}

/**
 * 移除非法字段，仅保留字母和数字
 * @param str
 * @returns
 */
export function stripString(str: string): string {
  return (str || '').replace(/[^a-zA-Z0-9]/g, '');
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined;
}

export function isArray<T extends any>(value: T[]): value is T[] {
  return Array.isArray(value);
}

export function isPlainObject(value: any): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isEmpty(value: any): boolean {
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
export function intersection<T extends any>(a: T[], b: T[]): T[] {
  return [...new Set(a.filter((item) => b.includes(item)))];
}

/**
 * 获取数组并集
 * @param a
 * @param b
 * @returns
 */
export function union<T extends any>(a: T[], b: T[]): T[] {
  return [...new Set([...a, ...b])];
}

function inContainerList(element: Element, containerList: Element[]): boolean {
  return containerList.some((container) => container.contains(element));
}

/**
 * 获取指定坐标的元素, 排除指定的元素
 * @param excludeContainers
 * @param point
 * @returns
 */
export function getOwnElement(excludeContainers: Element[], point: Point) {
  const pointElement = document.elementFromPoint(point.x, point.y);
  if (!inContainerList(pointElement, excludeContainers)) {
    return pointElement;
  }

  const elements = document.elementsFromPoint(point.x, point.y);
  return elements.find((element) => !inContainerList(element, excludeContainers));
}

/**
 * 根据选择器获取元素列表
 * @param selector
 */
export function getElementList(selectors: string[]): Element[] {
  return selectors.reduce((acc, selector) => {
    return [...acc, ...document.querySelectorAll(selector)];
  }, []);
}
