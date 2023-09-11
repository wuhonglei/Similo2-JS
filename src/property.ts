/**
 * 获取 element 的属性
 */

import type { Property, ElementLocation } from './interface/property';

import { elementIsVisible, getElementByXPath, uniqElements } from './utils/index';
import { getIdXPath, getXPath } from './utils/locator';

/**
 * 获取元素 classList
 * @param element HTMLElement
 * @returns class 数组
 */
function getElementClassList(element: Element): string[] {
  return Array.from(element.classList).filter((className) => !['undefined', 'null'].includes(className));
}

function isButtonElement(element: Element): boolean {
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

  if (tagName === 'INPUT' && ['button', 'submit', 'reset'].includes((element as HTMLInputElement).type)) {
    return true;
  }

  return false;
}

function getElementLocation(element: Element): ElementLocation {
  const { left, top, width, height } = element.getBoundingClientRect();
  return {
    x: Math.floor(left),
    y: Math.floor(top),
    width: Math.floor(width),
    height: Math.floor(height),
  };
}

function getElementArea(location: ElementLocation): number {
  const { width, height } = location;
  return width * height;
}

function getElementShape(location: ElementLocation): number {
  const { width, height } = location;
  return Math.floor((width * 100) / height);
}

function getVisibleText(element: Element): string[] {
  // textContent 会获取到隐藏元素的文本，所以使用 innerText
  const text = ['innerText', 'value', 'placeholder'].map((name) => ((element as any)[name] || '').trim()).find(Boolean);
  return (text || '').split(/[\n\s]+/);
}

function getElementHeight(element: Element): number {
  return element.getBoundingClientRect().height;
}

/**
 * 判断是否是同一个元素
 * @param parentElement
 * @param element
 * @returns
 */
function isSameElement(parentElement: Element, element: Element): boolean {
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
function getNeighborText(element: Element, location: ElementLocation): string[] {
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
  const neighborElements: Element[] = [];
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
  const textListByString = uniqElements(
    neighborElements
      // 过滤掉高度大于 100 的元素
      .filter((element) => getElementHeight(element) <= 100),
  ).reduce(
    (textMap, currentElement) => {
      const text = getVisibleText(currentElement); // 'src \n  上传打包后的内容'
      textMap[text.join(' ')] = text; // 使用 map 是为了解决元素周围的文本重复的问题
      return textMap;
    },
    {} as Record<string, string[]>,
  );

  return Object.values(textListByString).flat().filter(Boolean); // 原始数据不进行去重
}

/**
 * 获取单个元素的属性定位参数
 * @param element
 * @returns
 */
export function getElementProperties(element: Element): Property {
  if (!element) {
    console.warn('element is null');
    return {} as Property;
  }

  const tag = element.tagName as Property['tag'];
  const classList = getElementClassList(element);
  const name: string = (element as any).name;
  const id = element.id || '';
  const href: string = (element as any).href || '';
  const alt: string = (element as any).alt || '';
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
export function getCandidateElementsPropertiesBySelector(
  selector: Parameters<ParentNode['querySelectorAll']>[0],
): Property[] {
  const elements = document.querySelectorAll(selector);
  return [...elements].filter((element) => elementIsVisible(element)).map((element) => getElementProperties(element));
}

export function getElementPropertiesByXpath(xpath: string): Property {
  const element = getElementByXPath(xpath);
  return getElementProperties(element);
}
