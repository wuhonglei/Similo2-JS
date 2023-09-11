import type { Property, PropertyConfig, PropertyConfigByName, PropertyName } from '../interface/property';
import {
  equalSimilarity,
  equalSimilarityCaseInsensitive,
  integerSimilarity,
  pointSimilarity,
  stringSimilarity,
} from '../utils/compare';

export const propertyConfigByName: PropertyConfigByName<PropertyName> = {
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
    compare: (a: string[], b: string[]) => stringSimilarity(a.join(' ').toLowerCase(), b.join(' ').toLowerCase()),
  },
  neighborText: {
    weight: 1.5,
    compare: (a: string[], b: string[]) => stringSimilarity(a.join(' ').toLowerCase(), b.join(' ').toLowerCase()),
  },
  classList: {
    weight: 0.5,
    compare: (a: string[], b: string[]) => stringSimilarity(a.join(' ').toLowerCase(), b.join(' ').toLowerCase()),
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
    compare: stringSimilarity,
  },
  idxpath: {
    weight: 0.5,
    compare: stringSimilarity,
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
} as const;

export const propertyNames = Object.keys(propertyConfigByName) as PropertyName[];
