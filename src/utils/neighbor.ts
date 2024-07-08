/**
 * 文本采集
 */

import { getElementList, getOwnElement, isEmpty, uniqElements } from '.';
import { ElementLocation, ElementPropertiesOption, Point } from '../interface';

export function getElementLocation(element: Element): ElementLocation {
  const { left, top, width, height } = element.getBoundingClientRect();
  return {
    x: Math.floor(left),
    y: Math.floor(top),
    width: Math.floor(width),
    height: Math.floor(height),
  };
}

/**
 * 使用浏览器内置的 Intl.Segmenter API 进行分词
 * 分词性能和 replace 相当
 * @param text
 */
function wordSegmentation(text: string): string[] {
  if (isEmpty(text)) {
    return [];
  }

  const segmenter = new Intl.Segmenter('en', {
    granularity: 'word',
  });
  const segments = segmenter.segment(text);
  return Array.from(segments)
    .filter((segment) => segment.isWordLike)
    .map((segment) => segment.segment);
}

export function getVisibleTextWithoutSegmentation(element: Element): string {
  // textContent 会获取到隐藏元素的文本，所以使用 innerText
  const text = ['innerText', 'value', 'placeholder'].map((name) => ((element as any)[name] || '').trim()).find(Boolean);
  return text;
}

export function getVisibleText(element: Element): string[] {
  const text = getVisibleTextWithoutSegmentation(element);
  const inputElements: NodeListOf<HTMLInputElement> = element.querySelectorAll('input, textarea');
  // 解决 element 包含 input 元素时，input 元素的文本无法被获取的问题
  const valueTexts = Array.from(inputElements)
    .map((inputElement) => getVisibleTextWithoutSegmentation(inputElement))
    .filter(Boolean);
  const textList = [text, ...valueTexts].filter(Boolean);
  return wordSegmentation(textList.join(' '));
}

function getElementHeight(element: Element): number {
  return element.getBoundingClientRect().height;
}

/**
 * 判断是否是有效的邻居节点
 * @param neighborElement
 * @param targetElement
 * @returns
 */
function isValidNeighborElement(neighborElement: Element, targetElement: Element): boolean {
  if (!neighborElement) {
    return false;
  }

  if (neighborElement === targetElement) {
    return false;
  }

  // 不允许是父节点，因为父节点的文本一般包含子节点的文本
  if (neighborElement.contains(targetElement)) {
    return false;
  }

  // 过滤掉高度大于 100 的元素
  if (getElementHeight(neighborElement) > 100) {
    return false;
  }

  return true;
}

/**
 * 判断点是否在元素区域内
 * @param point
 * @param elementLocations
 */
function doesPointInLocation(point: Point, elementLocations: ElementLocation[]): boolean {
  return elementLocations.some((location) => {
    const { x, y, width, height } = location;
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  });
}

/**
 * 获取元素周围 50px 的文本
 * @param location 元素区域
 * @returns string
 */
export function getNeighborText(
  element: Element,
  location: ElementLocation,
  option: Partial<Pick<ElementPropertiesOption, 'excludeContainers'>>,
): string[] {
  const { x, y, width, height } = location;

  /**
   * TODO: 元素区域过大时，不进行文本获取 (Why?)
   */
  if (height > 100 || width > 600) {
    return [];
  }

  const excludeContainers = getElementList(option?.excludeContainers || []);

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
  const elementLocations: ElementLocation[] = [];
  areas.forEach((area) => {
    const [x1, y1, x2, y2] = area;
    for (let i = x1; i < x2; i += xStep) {
      for (let j = y1; j < y2; j += yStep) {
        const point = { x: i, y: j };
        if (doesPointInLocation(point, elementLocations)) {
          continue;
        }

        const neighborElement = getOwnElement(excludeContainers, point);
        if (isValidNeighborElement(neighborElement, element)) {
          neighborElements.push(neighborElement);
          elementLocations.push(getElementLocation(neighborElement));
        }
      }
    }
  });

  // 获取元素周围的文本
  const textListByString = neighborElements.reduce(
    (textMap, currentElement) => {
      const text = getVisibleText(currentElement); // 'src \n  上传打包后的内容'
      textMap[text.join(' ')] = text; // 使用 map 是为了解决元素周围的文本重复的问题
      return textMap;
    },
    {} as Record<string, string[]>,
  );

  return Object.values(textListByString).flat().filter(Boolean); // 原始数据不进行去重
}
