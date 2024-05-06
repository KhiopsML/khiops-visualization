import { MarkedOptions } from 'marked';
import { MarkedRenderer } from 'ngx-markdown';

export function MarkedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.link = (href: string, title: string, text: string) => {
    return text;
  };

  return {
    renderer: renderer,
    // @ts-ignore
    sanitize: true, // Doisable html links
  };
}
