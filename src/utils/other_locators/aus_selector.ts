// get selector path
export function getAusDomPath(target: Element) {
  if (!target) {
    return null;
  }

  return getRelativeDomPath(target.ownerDocument, target, true);
}

const mapPathAttrs = {
  id: true,
  value: true,
  name: true,
  text: true,
  role: true,
  type: true,
  'data-id': true,
  'data-name': true,
  'data-type': true,
  'data-role': true,
  'data-value': true,
};

const arrPathAttrs = [
  {
    name: 'id',
    on: true,
  },
  {
    name: 'value',
    on: true,
  },
  {
    name: 'name',
    on: true,
  },
  {
    name: 'text',
    on: true,
  },
  {
    name: 'role',
    on: true,
  },
  {
    name: 'type',
    on: true,
  },
  {
    name: 'data-id',
    on: true,
  },
  {
    name: 'data-name',
    on: true,
  },
  {
    name: 'data-type',
    on: true,
  },
  {
    name: 'data-role',
    on: true,
  },
  {
    name: 'data-value',
    on: true,
  },
];

const reTextValueBlack = /(^\s+$|\n)/;

function checkUniqueXPath(relativeNode, path, isAllDom = true) {
  try {
    const result = document.evaluate(path, relativeNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    return result.snapshotLength === 1;
  } catch (e) {
    return false;
  }
}

function checkUniqueSelector(relativeNode, path, isAllDom = true) {
  try {
    const elements = relativeNode.querySelectorAll(path);
    return elements.length === 1;
  } catch (e) {
    return false;
  }
}

function getChildIndex(el) {
  let index = 0;
  let fixedIndex = 0;
  const { parentNode } = el;
  if (parentNode) {
    const { childNodes } = parentNode;
    for (let i = 0, len = childNodes.length; i < len; i++) {
      const node = childNodes[i];
      if (node.nodeType === 1) {
        index++;
        if (node === el) {
          break;
        }
      }
    }
  }

  return { index, fixedIndex };
}

// 读取最近的id唯一节点
function getClosestIdNode(target, isAllDom) {
  let current = target;
  const { body } = target.ownerDocument;
  while (current !== null) {
    if (current.nodeName !== 'HTML') {
      const testidValue = current.getAttribute && current.getAttribute('data-testid');
      const idValue = current.getAttribute && current.getAttribute('id');
      if (testidValue && checkUniqueSelector(body, `[data-testid="${testidValue}"]`, isAllDom)) {
        return {
          node: current,
          path: `[data-testid="${testidValue}"]`,
        };
      }
      if (idValue && checkUniqueSelector(body, `#${idValue}`, isAllDom)) {
        return {
          node: current,
          path: `#${idValue}`,
        };
      }
      current = current.parentNode;
    } else {
      current = null;
    }
  }
  return null;
}

// 获取节点 CSS 选择器
function getSelectorElement(target, rootNode, relativePath, childPath, isAllDom) {
  const tagName = target.nodeName.toLowerCase();
  let elementPath = tagName;
  let tempPath;
  // 校验tagName是否能唯一定位
  tempPath = elementPath + (childPath ? ` > ${childPath}` : '');
  if (checkUniqueSelector(rootNode, relativePath + tempPath, isAllDom)) {
    return `!${tempPath}`;
  }
  // 校验class能否定位
  let relativeClass = null;
  const classValue = target?.getAttribute('class') || '';
  const cacheClassNameList = [];
  const validClassNameList = classValue.split(/\s+/).filter(Boolean);
  for (let index = 0, len = validClassNameList.length; index < len; index++) {
    const className = validClassNameList[index];
    cacheClassNameList.push(className);
    const unionClassName = cacheClassNameList.length ? '.' + cacheClassNameList.join('.') : '';
    tempPath = `${elementPath}${unionClassName}${childPath ? ` > ${childPath}` : ''}`;
    if (checkUniqueSelector(rootNode, relativePath + tempPath, isAllDom)) {
      return `!${tempPath}`;
    }

    // 无法绝对定位,再次测试是否可以在父节点中相对定位自身
    const parent = target.parentNode;
    if (parent && unionClassName) {
      const element = parent.querySelectorAll(`:scope > ${unionClassName}`);
      if (element.length === 1) {
        relativeClass = unionClassName;
      }
    }
  }

  // 校验属性是否能定位
  const validAttrList = arrPathAttrs.filter((attr) => attr.on);
  for (let index = 0, len = validAttrList.length; index < len; index++) {
    const attrName = validAttrList[index].name;
    const attrValue = target.getAttribute && target.getAttribute(attrName);
    if (attrValue) {
      elementPath += `[${attrName}="${attrValue}"]`;
      tempPath = elementPath + (childPath ? ` > ${childPath}` : '');
      if (checkUniqueSelector(rootNode, relativePath + tempPath, isAllDom)) {
        return `!${tempPath}`;
      }
    }
  }

  let fixedElementPath = elementPath;
  // 父元素定位
  if (relativeClass) {
    elementPath += `${relativeClass}`;
    fixedElementPath = elementPath;
  } else {
    const { index, fixedIndex } = getChildIndex(target);
    if (index >= 1) {
      fixedElementPath += `:nth-child(${fixedIndex})`;
      elementPath += `:nth-child(${index})`;
    }
  }
  tempPath = elementPath + (childPath ? ` > ${childPath}` : '');
  if (checkUniqueSelector(rootNode, relativePath + tempPath, isAllDom)) {
    return `!${tempPath}`;
  }
  return tempPath;
}

function getRelativeDomPath(rootNode, target, isAllDom) {
  let relativePath = '';
  let childPath = '';
  const tagName = target.nodeName.toLowerCase();
  let tempPath;
  const testidValue = target.getAttribute && mapPathAttrs.id && target.getAttribute('data-testid');
  const idValue = mapPathAttrs.id && target.getAttribute && target.getAttribute('id');
  const textValue =
    mapPathAttrs.text && target.childNodes.length === 1 && target.firstChild.nodeType === 3 && target.textContent;
  const nameValue = mapPathAttrs.name && target.getAttribute && target.getAttribute('name');
  const typeValue = mapPathAttrs.type && target.getAttribute && target.getAttribute('type');
  const valueValue = mapPathAttrs.value && target.getAttribute && target.getAttribute('value');
  const tempTestPath = `[data-testid="${testidValue}"]`;
  const tempIdPath = `#${idValue}`;
  const tempTextPath = `//${tagName}[text()="${textValue}"]`;
  if (
    textValue &&
    !reTextValueBlack.test(textValue) &&
    textValue.length <= 50 &&
    checkUniqueXPath(rootNode, tempTextPath, isAllDom)
  ) {
    // text定位
    return tempTextPath;
  }
  // 检查目标元素自身是否有唯一id
  if (idValue && checkUniqueSelector(rootNode, tempIdPath, isAllDom)) {
    // id定位
    return tempIdPath;
  }
  if (testidValue && checkUniqueSelector(rootNode, tempTestPath)) {
    return tempTestPath;
  }
  if (tagName === 'input') {
    // 表单项特殊校验
    tempPath = nameValue ? `${tagName}[name="${nameValue}"]` : tagName;
    if (valueValue) {
      switch (typeValue) {
        case 'radio':
        case 'checkbox':
          tempPath += `[value="${valueValue}"]`;
          break;
      }
    }
    tempPath += childPath ? ` > ${childPath}` : '';
    if (checkUniqueSelector(rootNode, tempPath, isAllDom)) {
      return tempPath;
    }
  } else if (nameValue) {
    // 非input，但有name值
    tempPath = `${tagName}[name="${nameValue}"]`;
    if (tempPath && checkUniqueSelector(rootNode, tempPath, isAllDom)) {
      return tempPath;
    }
  } else if (mapPathAttrs.id) {
    // 检查目标是否有父容器有唯一id
    const idNodeInfo = getClosestIdNode(target, isAllDom);
    if (idNodeInfo) {
      relativePath = `${idNodeInfo.path} `;
    }
  }
  let current = target;
  childPath = '';
  while (current !== null) {
    if (current !== rootNode) {
      childPath = getSelectorElement(current, rootNode, relativePath, childPath, isAllDom);
      if (childPath.substring(0, 1) === '!') {
        return relativePath + childPath.substring(1);
      }
      current = current.parentNode;
    } else {
      current = null;
    }
  }
  return null;
}
