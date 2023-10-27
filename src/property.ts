/**
 * 获取 element 的属性
 */

import { propertyConfigByName } from './config';
import { commonTagList, propertyNames } from './constant';
import type {
  Property,
  ElementLocation,
  CandidateOption,
  ElementPropertiesOption,
  PropertyName,
} from './interface/property';

import {
  elementIsVisible,
  getElementByXPath,
  getElementList,
  getOwnElement,
  isEmpty,
  uniqElements,
} from './utils/index';
import { getIdXPath, getXPath } from './utils/locator';
import { getElementLocation, getNeighborText, getVisibleText } from './utils/neighbor';
export { getElementByXPath, getElementByCssSelector, getElementBySelector } from './utils/index';
export { getIdXPath, getXPath } from './utils/locator';
export { elementIsVisible } from './utils/index';

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

function getElementArea(location: ElementLocation): number {
  const { width, height } = location;
  return width * height;
}

function getElementShape(location: ElementLocation): number {
  const { width, height } = location;
  return Math.floor((width * 100) / height);
}

function getTagName(element: Element): string {
  return element.tagName;
}

function getName(element: Element): string {
  return (element as any).name || '';
}

function getId(element: Element): string {
  return element.id || '';
}

function getHref(element: Element): string {
  return (element as any).href || '';
}

function getAlt(element: Element): string {
  return (element as any).alt || '';
}

const funcByPropertyName: Record<
  PropertyName,
  (target: Element, data: Partial<Property>, option?: Parameters<typeof getElementProperties>[1]) => any
> = {
  tag: getTagName,
  classList: getElementClassList,
  name: getName,
  id: getId,
  href: getHref,
  alt: getAlt,
  xpath: getXPath,
  idxpath: getIdXPath,
  isButton: isButtonElement,
  location: getElementLocation,
  area: (_element, data) => getElementArea(data.location),
  shape: (_element, data) => getElementShape(data.location),
  visibleText: getVisibleText,
  neighborText: (element, data, option) => getNeighborText(element, data.location, option),
};

function getPropertyNames(option: Partial<ElementPropertiesOption>): PropertyName[] {
  const { propertyNames, ignoreNames, initialData } = option;
  return propertyNames.filter((name) => !ignoreNames.includes(name) && !(name in initialData));
}

/**
 * 选项配置默认值处理
 * @param option
 * @returns
 */
function formatOption(option?: Partial<ElementPropertiesOption>): ElementPropertiesOption {
  const newOption: ElementPropertiesOption = {
    initialData: {},
    excludeContainers: [],
    ignoreNames: [],
    propertyNames: [...propertyNames],
    ...(option || {}),
  };
  newOption.propertyNames = getPropertyNames(newOption);
  return newOption;
}

/**
 * 获取单个元素的属性定位参数
 * @param element
 * @param option
 * @returns
 */
export function getElementProperties(element: Element, option?: Partial<ElementPropertiesOption>): Partial<Property> {
  if (!element) {
    console.warn('element is null');
    return {} as Property;
  }

  if (!document.contains(element)) {
    console.warn('element is not in document');
    return {} as Property;
  }

  // 处理 option
  const newOption = formatOption(option);
  const { initialData, propertyNames } = newOption;
  const data: Partial<Property> = {
    ...initialData,
  };
  propertyNames.forEach((propertyName) => {
    // @ts-ignore
    data[propertyName] = funcByPropertyName[propertyName](element, data, newOption);
  });

  return data;
}

/**
 * 获取候选元素的属性定位参数
 * @param tagList
 * @returns 返回逗号分隔的选择器, 例如 div,span,p
 */
export function getCommonSelector(tagList?: string[]): string {
  const lowerCaseTagList = (tagList || []).map((tag) => tag.toLowerCase());
  return [...new Set([...commonTagList, ...lowerCaseTagList])].join(',');
}

/**
 * 获取候选元素的属性定位参数
 * @param selector
 * @returns
 */
export function getCandidateElementsPropertiesBySelector(
  elements: Element[],
  option?: Partial<CandidateOption & ElementPropertiesOption & { returnElement?: boolean }>,
): Partial<Property>[] {
  option = { isAllDom: false, returnElement: false, ...option };
  return [...elements]
    .filter((element) => option.isAllDom || elementIsVisible(element))
    .map((element) => {
      const extra = {
        element: option.returnElement ? element : undefined,
      };
      const initialData = { extra, ...option.initialData };
      return getElementProperties(element, { ...option, initialData });
    });
}

export function getElementPropertiesByXpath(
  xpath: string,
  option?: Partial<ElementPropertiesOption>,
): Partial<Property> {
  const element = getElementByXPath(xpath);
  return getElementProperties(element, option);
}

/**
 * 返回包含 NeighborText 的属性列表
 * 首先，将不包含 NeighborText 的属性得分进行降序排序
 * 然后，截取得分 >= maxScore - neighborText.weight 属性列表，并重新计算 NeighborText
 * @param properties
 * @param scores
 * @returns
 */
export function getElementsNeighborProperties(properties: Partial<Property>[], scores: number[]): Partial<Property>[] {
  const propertiesWithScores = properties.map((property, index) => ({
    property,
    score: scores[index],
  }));
  const sortedProperties = propertiesWithScores.sort((a, b) => b.score - a.score); // 降序

  const maxScore = sortedProperties[0].score;
  const lastScore = maxScore - propertyConfigByName.neighborText.weight;
  return sortedProperties
    .filter((p) => p.score >= lastScore)
    .map((p) =>
      getElementProperties(p.property.extra.element, { propertyNames: ['neighborText'], initialData: p.property }),
    );
}
