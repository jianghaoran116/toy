export class ToyVue {
  constructor(config) {
    this.template = document.querySelector(config.el);
    this.data = reactive(config.data); // 对data进行reactive包装 data变成可被监听

    for (let name in config.methods) {
      this[name] = () => {
        config.methods[name].apply(this.data);
      }
    }
  
    this.traversal(this.template);
  }

  // 处理模版的过程
  traversal(node) {
    // 如果是textnode
    if (node.nodeType === Node.TEXT_NODE) { // 3
      if(node.textContent.trim().match(/^{{([\s\S]+)}}$/)) {
        let name = RegExp.$1;
        effect(() => node.textContent = this.data[name]);
      }
    }

    // 访问attributes
    if (node.nodeType === Node.ELEMENT_NODE) { // 1
      let attributes = node.attributes;
      for ( let attribute of attributes ) {
        // console.log(attribute.name);
        if (attribute.name === 'v-model') {
          let name = attribute.value;
          effect(() => node.value = this.data[name]);
          node.addEventListener('input', event => this.data[name] = node.value)
        }

        if (attribute.name.match(/^v-bind:([\s\S]+)$/)) {
          let attrName = RegExp.$1;
          let name = attribute.value;
          effect(() => node.setAttribute(attrName, this.data[name]));
        }

        if (attribute.name.match(/^v-on:([\s\S]+)$/)) {
          let eventName = RegExp.$1;
          let name = attribute.value;
          node.addEventListener(eventName, this[name])
        }
      }
    }

    // 递归调用每一个元素
    if (node.childNodes && node.childNodes.length > 0) {
      for ( let child of node.childNodes ) {
        this.traversal(child);
      }
    }
  }
}

// const effects = [];
const effects = new Map();
let currenEffect = null;

function effect(fn) {
  currenEffect = fn;
  fn();
  currenEffect = null;
};

// 可被监听的对象
function reactive(object) {
  const observed = new Proxy(object, {
    // 在get里做依赖收集
    get(object, property) {
      if (currenEffect) {
        if (!effects.has(object))
          effects.set(object, new Map());

        if (!effects.get(object).has(property))
          effects.get(object).set(property, []);

        effects.get(object).get(property).push(currenEffect);
      }

      return object[property];
    },

    // 通过set可以监听到哪个属性赋值到哪 - 双向绑定的基础
    set(object, property, value) {
      object[property] = value;
      // for (let effect of effects) { // 加入有100个effect 100个object 那就要执行 100*100次
      //   effect();
      // }
      if (effects.has(object) && effects.get(object).get(property)){
        for (let effect of effects.get(object).get(property)) {
          effect();
        }
      }

      return value;
    },
  });

  return observed;
}

// let dummy;
// const counter = reactive({ num: 0 }); // num如果是个对象 使用递归
// effect(() => (dummy = counter.num));
// console.log(dummy);
// counter.num = 7;
// console.log(dummy);
