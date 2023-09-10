export function elementIsVisible(element: HTMLElement) {
  if (getComputedStyle(element).visibility === 'hidden' || element.getBoundingClientRect().height == 0) {
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
