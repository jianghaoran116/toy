const api = {
  replaceChild(oldElement, element) {
    window.oldElement = oldElement;
    return oldElement.parentElement.replaceChild(element, oldElement);
  },
}

// 依赖分析的类
class Dep {
  constructor() {
    this.subs = []; // 都有谁监听我了
  }

  notify() { // 通知监听者
    const subs = this.subs.slice();
    console.log("subs::::", subs);
    for (let i = 0, len = this.subs.length; i < len; i++ ) {
      console.log("subs update::::", subs[i].update);
      subs[i].update();
    }
  }

  addSub(sub) {
    if (this.subs.indexOf(sub) === -1) {
      this.subs.push(sub);
    }
  }

  addDepend() {
    console.log('addDepend::::', this);
    Dep.targets[Dep.targets.length - 1].addDep(this);
  }
}

Dep.targets = [];

function pushTarget(instance) {
  Dep.targets.push(instance); // 接下来所有的依赖都算在这个instance头上
}

function popTarget() {
  return Dep.targets.pop();
}

class Watcher {
  /**
   * wtahcer get的时候把自己记录一下 getter的时候收集依赖
   * @param {function} expression - 每次render的时候执行一下 看看里面依赖了哪些属性
   * @param {function} callback - 通知外头
   */
  constructor(expression, callback) {
    this.callback = callback; // 属性变化的时候调一下callback
    this.getter = expression;

    this.value = this.get();
  }

  get() {
    console.log('watcher get');
    pushTarget(this);
    let value = this.getter();
    popTarget();
    return value;
  }

  addDep(dep) {
    dep.addSub(this);
  }

  update() {
    let newValue = this.get();
    this.value = newValue;
    this.callback && this.callback();
  }
}

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

function defineReactive(target, key, value) {

  const dep = new Dep();

  Reflect.defineProperty(target, key, {
    get() { // 收集依赖
      if (Dep.targets.length > 0) {
        dep.addDepend();
      }
      return value;
    },
    set(val) {
      // set的时候通知刷新
      value = val;
      dep.notify();
    }
  })
}

class Observal {
  constructor(obj) {
    this.walk(obj);
  }

  walk(obj) {
    // Reflect.ownKeys(obj).forEach()
    Reflect.ownKeys(obj).forEach((key => {
      if (typeof obj[key] === 'object') {
        this.walk(obj[key]);
      }
  
      defineReactive(obj, key, obj[key]);
    }));
  
    return obj;
  }
}

export class ToyVue {
  constructor(options) {
    this.$el = document.querySelector(options.el);
    this._data = options.data && options.data();
    new Observal(this._data);

    for (let key in this._data) { // this.data 代理到 this上
      proxy(this, this._data, key);
    }

    this.render = options.render;

    new Watcher(() => {
      this._update();
    }, () => {
      console.log('callback!!!');
    })
  }

  _createElement(targeName, data, children) {
    const tag = document.createElement(targeName);
    const { attrs={} } = data;

    for (let attrName in attrs) {
      tag.setAttribute(attrName, attrs[attrName]);
    }

    if (Object.prototype.toString.call(children) !== "[object Array]") {
      let child = document.createTextNode(children);
      tag.appendChild(child);
    } else {
      children.forEach(child => tag.appendChild(child));
    }

    return tag;
  }

  _update() {
    const $root = this.render(this._createElement);
    api.replaceChild(this.$el, $root);
    this.$el = $root;
  }
  
}
