import * as puppeteer from 'puppeteer';
import { Uploader } from './uploader';
import { SitemapURLExtract } from './sitemap';
import { saveOrUpdateLookUpUrl } from './updateLookUpTable';
import { removeParams } from './queryConfig';
import { hashUrl } from '../shared/utils';

export class Scraper {
  constructor(private uploader: Uploader) {}
  // https://www.woolworths.com.au/shop/discover/about-us/offers-and-competitions?name=seafoodcomp-offer&cardId=5744
  // 'https://www.woolworths.com.au/shop/discover/about-us/offers-and-competitions?name=seafoodcomp-offer&cardId=5744'

  private async getHtmlContent(url: string) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    console.log('Navigating to ', url);
    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('Fetching html....');
    const pageContent = await page.content();
    browser.close();
    return pageContent;
  }

  async runner() {
    const siteMap = new SitemapURLExtract();
    const urls: any = await siteMap.urlExtract();
    console.log('URLS fetched from sitemaps!!!');
    const scraperUrl = urls[0].loc[0];
    await this.scrap(scraperUrl);
  }

  async scrap(url: string) {
    try {
      console.log('URL before deleting the params: ', url);
      const scraperUrl = removeParams(url);
      console.log(scraperUrl);

      const pageHtmlContent = await this.getHtmlContent(scraperUrl);

      const hashedFilename = hashUrl(scraperUrl);
      console.log('Uploading html to Azure blob storage...');
      await this.uploader.uploadFile(hashedFilename, pageHtmlContent);

      //Connection to DB and update the record in the table
      await saveOrUpdateLookUpUrl(hashedFilename);
      return pageHtmlContent;
    } catch (error) {
      console.error(`Error in processing ${url}\n`, error);
    }
  }
}
