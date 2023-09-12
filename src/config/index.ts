import type { Property, PropertyConfig, PropertyConfigByName, PropertyName } from '../interface/property';
import {
  classListSimilarity,
  equalSimilarity,
  equalSimilarityCaseInsensitive,
  integerSimilarity,
  pointSimilarity,
  stringSimilarity,
  wordSimilarity,
  xpathSimilarity,
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
} as const;

export const propertyNames = Object.keys(propertyConfigByName) as PropertyName[];
