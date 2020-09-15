class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(component) {
    this.root.appendChild(component.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
}

// 自定义组件继承这个class
export class Component{
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  appendChild(component) {
    this.children.push(component);
  }
  get
  root() {
    if (!this._root) {
      this._root = this.render().root;
    }
    return this._root
  }
}
/**
 * 
 * @param {Class} type - 如果是自定义的标签表示class 小写的表示原生的标签 
 * @param {Object} attributes 
 * @param {Array} children 
 */
export function createElement(type, attributes, ...children) {
  try {
    let tag;

    if (typeof type === 'string') { // 普通的标签
      tag = new ElementWrapper(type);
    } else { // 自定义组件
      tag = new type;
    }

    for (let attrName in attributes) {
      tag && tag.setAttribute(attrName, attributes[attrName]);
    }

    // insertChild
    (function insertChild(children) {
      children.forEach((child) => {
        if (typeof child === 'string') {
          child = new TextWrapper(child);
        }
        if ((typeof child === 'object') && (child instanceof Array)) {
          insertChild(child);
        } else {
          tag.appendChild(child);
        }
      });
    })(children);
    return tag;
  } catch(err) {
    console.log(err);
  }
}

export function render(component, parentComponent) {
  parentComponent.appendChild(component.root);
}