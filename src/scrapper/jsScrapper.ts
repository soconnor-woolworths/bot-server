import { JSDOM } from 'jsdom';

export const removeScripts = (content: any) => {
  const dom = new JSDOM(content);

  dom.window.document.querySelectorAll('script').forEach((scriptEl: any) => {
    scriptEl.remove();
  });

  dom.window.document.querySelectorAll('iframe').forEach((iframeEl: any) => {
    iframeEl.remove();
  });

  /* dom.window.document.querySelectorAll('img').forEach((imgEl: any) => {
    const source = imgEl.getAttribute('src');
    const sourceLazy = imgEl.getAttribute('data-src');
    if (source === null && sourceLazy !== null) {
      imgEl.setAttribute('src', sourceLazy);
    }
  }); */

  return dom.serialize();
};
