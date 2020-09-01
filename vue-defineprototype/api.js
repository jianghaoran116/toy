/**
 * @file 工具函数
 * @author haoran
 */

const api = {
  replaceChild: function(oldElement, element) {
    // window.oldElement = oldElement;
    return oldElement.parentElement.replaceChild(element, oldElement);
  }
};

export default api;