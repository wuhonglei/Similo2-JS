export interface ElementLocation {
  x: number; // 元素左上角起始 x 坐标
  y: number; // 元素左上角起始 y 坐标
  width: number; // 元素 width
  height: number; // 元素 height
}

export interface NeighborText {
  top: string; // 上
  right: string; // 右
  bottom: string; // 下
  left: string; // 左
}

export interface Properties {
  tag: Uppercase<keyof HTMLElementTagNameMap>;
  classList: string[]; // [class1, class2, class3]
  name: string; // name 属性值
  id: string; // id 属性值
  href: string; // 超链接地址
  alt: string; // img, area 替代文本
  xpath: string; // 绝对 xpath 路径 /html[1]/body[1]/main[1]/section[1]/figure[1]/article[1]/section[1]/ul[1]/li[1]/a[1]
  idxpath: string; // *[@id='gnav_547']/span[1]/span[1]
  isButton: boolean; // 是否是按钮
  location: ElementLocation;
  area: number; // width * height
  shape: number; // (width * 100) / height; 整形
  visibleText: string; // 可见文本(textContent, value, placeholder)
  neighborText: string[]; // 元素四周的邻居文本
}