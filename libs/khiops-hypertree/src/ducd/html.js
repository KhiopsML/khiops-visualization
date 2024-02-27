'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.HTML = void 0;
class HTML {
  static parse(htmlstr) {
    return function () {
      var template = document.createElement('template');
      template.innerHTML = htmlstr;
      return template.content.firstElementChild;
    };
  }
}
exports.HTML = HTML;
