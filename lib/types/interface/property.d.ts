export interface ElementLocation {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface NeighborText {
    top: string;
    right: string;
    bottom: string;
    left: string;
}
export interface Properties {
    tag: Uppercase<keyof HTMLElementTagNameMap>;
    classList: string[];
    name: string;
    id: string;
    href: string;
    alt: string;
    xpath: string;
    idxpath: string;
    isButton: boolean;
    location: ElementLocation;
    area: number;
    shape: number;
    visibleText: string[];
    neighborText: string[];
}
