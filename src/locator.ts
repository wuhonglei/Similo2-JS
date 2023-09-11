export function getXPath(element: Element): string {
  const idx = (sib: Element | null, name?: string): any =>
    sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;

  const segs = (elm: HTMLElement | Node | null): (string | number)[] =>
    !elm || elm.nodeType !== 1
      ? ['']
      : [
          ...segs(elm.parentNode),
          elm instanceof HTMLElement
            ? `${elm.localName}[${idx(elm)}]`
            : `*[local-name() = '${(elm as any).localName}'][${idx(elm as any)}]`,
        ];

  return segs(element).join('/');
}

export function getIdXPath(element: Element) {
  const idx = (sib: Element | null, name?: string): any =>
    sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
  const segs = (elm: Element | null): (string | number)[] =>
    !elm || elm.nodeType !== 1
      ? ['']
      : elm.id && document.getElementById(elm.id) === elm
      ? [`//*[@id='${elm.id}']`]
      : [
          ...segs((elm as any).parentNode),
          elm instanceof HTMLElement
            ? `${elm.localName}[${idx(elm)}]`
            : `*[local-name() = '${(elm as any).localName}'][${idx(elm)}]`,
        ];
  return segs(element).join('/');
}
