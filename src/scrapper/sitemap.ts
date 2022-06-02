import xml2js from 'xml2js';
import { https } from 'follow-redirects';
import { siteMapURL } from '../shared/ constants';

export class SitemapURLExtract {
  constructor() {}
  fetchXMLfromURL(url: any) {
    const parser = new xml2js.Parser();
    return new Promise((resolve, reject) => {
      https.get(url, (response: any) => {
        let responseXML: any = '';
        response.setEncoding('utf-8');
        response.on('data', function (chunk: any) {
          responseXML += chunk;
        });
        response.on('error', function (e: any) {
          console.log(e);
        });
        response.on('timeout', function (e: any) {
          console.log(e);
        });
        response.on('end', function () {
          parser.parseString(responseXML.toString(), (err, res) => {
            resolve(res);
          });
        });
      });
    });
  }
  async getWooliesURLs(data: any) {
    let WooliesURLArray: any = [];
    const sitemapurls = data.sitemapindex.sitemap;
    for (const [idx, sitemapLoc] of sitemapurls.entries()) {
      console.log('Fetching urls from ' + sitemapLoc.loc[0]);
      let WooliesURLs: any = await this.fetchXMLfromURL(sitemapLoc.loc[0]);
      WooliesURLArray = WooliesURLArray.concat(WooliesURLs.urlset.url);
      if (idx == sitemapurls.length - 1) {
        return WooliesURLArray;
      }
    }
  }
  urlExtract() {
    return new Promise(async (resolve, reject) => {
      console.log('Fetching index sitemap...');
      const sitemapData: any = await this.fetchXMLfromURL(siteMapURL);
      console.log('Fetching sub sitemaps...');
      resolve(await this.getWooliesURLs(sitemapData));
    });
  }
}
