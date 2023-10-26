import type { PropertyName } from '../interface';

/**
 * 根据经验，将表现一致的表情符号放在一起
 */
export const tagGroupList = [
  ['input', 'textarea'],
  ['h1', 'h2', 'h3', 'h4', 'h5'],
  ['span', 'i'],
  ['ul', 'li'],
  ['div', 'section', 'p', 'article'],
  ['th', 'tr', 'td'],
  ['strong', 'b'],
  ['audio', 'video', 'source', 'figure', 'img'],
];

/**
 * 常见标签
 */
export const commonTagList = [
  'input',
  'textarea',
  'button',
  'select',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'li',
  'span',
  'div',
  'p',
  'th',
  'tr',
  'td',
  'label',
  'svg',
];

export const propertyNames: PropertyName[] = [
  'tag',
  'classList',
  'id',
  'name',
  'href',
  'alt',
  'xpath',
  'idxpath',
  'isButton',
  'location',
  'area',
  'shape',
  'visibleText',
  'neighborText',
];
