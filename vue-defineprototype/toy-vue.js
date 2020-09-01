/**
 * @file 史上最挫VUE
 * @author haoran
 */
import api from "./api.js";

function proxy(target, data, key) {
  Reflect.defineProperty(target, key, {
    get() {
      return data[key];
    },
    set(val) {
      data[key] = val;
    }
  })
}

export class ToyVue {
  constructor(options) {
    this.$el = document.querySelector(options.el);
    this._data = options.data();

    for (let key in this._data) { // this.data 代理到 this上
      proxy(this, this._data, key);
    }

    this.render = options.render;

    this._update();
  }

  _createElement(targetName, data, children) {
    const target = document.createElement(targetName);
    const { attributes = {} } = data;

    for (let attributeName in attributes) {
      target.setAttribute(attributeName, attributes[attributeName]);
    }

    if (Object.prototype.toString.call(children) !== '[object Array]') {
      let child = document.createTextNode(children);
      target.appendChild(child);
    } else {
      children.forEach((child) => { target.appendChild(child) });
    }

    return target;
  }

  // 
  _update() {
    const $root = this.render(this._createElement);
    api.replaceChild(this.$el, $root);
    this.$el = $root;
  }
}