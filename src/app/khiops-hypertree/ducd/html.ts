export class HTML {
  static parse(htmlstr: string): () => Element | null {
    return function () {
      const template = document.createElement('template');
      template.innerHTML = htmlstr;
      return template.content.firstElementChild;
    };
  }
}