/**
 * ./node_modules/.bin/karma start  vue/vue3/karma.conf.js
 */
import {VNode} from "./vnode";

export class Vue3 {
  constructor(options) {
    this.$options = options;

    const proxy = this.initDataProxy();
    this.initWatch();

    return proxy;
  }

  /**
   * @see https://stackoverflow.com/questions/37714787/can-i-extend-proxy-with-an-es2015-class
   */
  initDataProxy() {
    const data = this.$options.data ? this.$options.data(): {};

    return new Proxy(this, {
      set: (target, key, current, receiver) => {
        const prev = data[key];
        data[key] = current;

        if (prev !== current) {
          this.notify(key, prev, current);
        }

        return true;
      },
      get: (target, key, receiver) => {
        if (key in this) {
          return this[key];
        }

        return data[key];
      }
    });
  }

  initWatch() {
    this.dataNotifyChain = {};
  }

  notify(key, prev, current) {
    (this.dataNotifyChain[key] || []).forEach((cb) => cb(prev, current));
  }

  $watch(key, cb) {
    (this.dataNotifyChain[key] || []).push(cb);
  }

  $mount(root) {
    const vnode = this.$options.render(this.createVNode);
    this.$el = this.createDOMElement(vnode);

    if (root) {
      root.appendChild(this.$el);
    }

    return this;
  }

  createVNode(tagName, attributes, children) {
    return new VNode(tagName, attributes, children);
  }

  createDOMElement(vnode) {
    const element = document.createElement(vnode.tagName);

    for (let key in vnode.attributes) {
      element.setAttribute(key, vnode.attributes[key]);
    }

    if (typeof vnode.children === 'string') {
      element.textContent = vnode.children;
    } else {
      console.log(vnode, vnode.children);
      vnode.children.forEach((child) => {
        if (typeof vnode.children === 'string') {
          element.textContent = vnode.children;
        } else {
          element.appendChild(this.createDOMElement(child));
        }
      });
    }

    return element;
  }
}
