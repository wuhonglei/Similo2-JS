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
export interface Property {
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
export interface Point {
    x: number;
    y: number;
}
export type PropertyName = keyof Property;
export type CompareFunction<T extends PropertyName> = (a: Property[T], b: Property[T]) => number;
export interface PropertyConfig<T extends PropertyName> {
    weight: number;
    compare: CompareFunction<T>;
}
export type PropertyConfigByName<Key extends PropertyName> = {
    [K in Key]: PropertyConfig<K>;
};
