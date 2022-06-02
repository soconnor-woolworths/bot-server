import dotenv from 'dotenv';
import { Mongoose } from 'mongoose';
import { connectMongoDb } from '../shared/connect-db';
import { Scraper } from './scraper';
import { Uploader } from './uploader';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

let mongoose: Mongoose;
connectMongoDb()
  .then(() => {
    const scraper = new Scraper(new Uploader());
    scraper.runner();
  })
  .catch((err) => {
    console.error({ err });
  })
  .finally(() => {
    if (mongoose) {
      mongoose.disconnect();
    }
  });

// TODO: Get list of urls we want to exclude query params from
// TODO: Scrape mobile, tablet and desktop versions
// TODO: Loop through urls from site map (ignoring duplicates from the list above)
// TODO: Remove any <script> tags
// TODO: Store the files locally - save based on the url name - be aware of special characters (change the character to something else)
// TODO: Store the files on blob storage
