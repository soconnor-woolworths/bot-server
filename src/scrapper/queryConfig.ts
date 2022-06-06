import nodeURL from 'url';
import configJson from './config.json';

export const removeParams = (url: string) => {
  console.log({ configJson });
  const category = url.split('/')[4];
  console.log('Removing params for category: ', category);
  const urlObj = new nodeURL.URL(url);
  const urlParams = new nodeURL.URLSearchParams(urlObj.search);
  const emptyURLParams = new nodeURL.URLSearchParams('');
  const allParams = Array.from(urlParams.keys());
  const reqParams = configJson.find((item: any) => {
    return (item['category'] = category);
  });
  urlObj.search = '';
  if (reqParams) {
    allParams.filter((param) => {
      if (reqParams.requiredParams.indexOf(param) != -1) {
        emptyURLParams.append(param, urlParams.get(param) || '');
      }
    });
    urlObj.search = emptyURLParams.toString();
    console.log('URL after deleting the params', urlObj.toString());
  }
  return urlObj;
};
