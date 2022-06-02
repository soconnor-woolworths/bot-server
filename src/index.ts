import express from 'express';
import dotenv from 'dotenv';
import { connectMongoDb } from './shared/connect-db';
import { Mongoose } from 'mongoose';
import {
  getWoolworthsUrl,
  hashUrl,
  shouldReadFromBlogStorage,
} from './shared/utils';
import { BlobReader } from './blob-reader';
import { Scraper } from './scrapper/scraper';
import { Uploader } from './scrapper/uploader';
import path from 'path';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

const app = express();

const blobReader = new BlobReader();
app.use('/favicon.ico', async (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.ico'));
});

app.get('/', async (req, res) => {
  console.log('route /');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', async (req, res) => {
  console.log('route *');
  const { url } = req;
  console.log({ url });
  try {
    const woolworthsUrl = getWoolworthsUrl(url);
    console.log({ woolworthsUrl });

    const hashedUrl = hashUrl(woolworthsUrl);
    console.log({ hashedUrl });

    const readFromBlob = await shouldReadFromBlogStorage(hashedUrl);
    console.log({ readFromBlob });

    if (readFromBlob) {
      console.log('reading from blob storage');
      const content = await blobReader.getFromBlobStorage(hashedUrl);
      res.send(content);
    } else {
      const content = await new Scraper(new Uploader()).scrap(woolworthsUrl);
      if (content) {
        return res.send(content);
      }
      throw new Error('No content received from scapper');
    }
  } catch (error) {
    console.error(`Error responding to ${url}`, error);
    res.sendStatus(500);
  }
});

connectMongoDb()
  .then((mongoose: Mongoose) => {
    mongoose.connection.db
      .listCollections()
      .toArray(function (err, collections) {
        if (err) {
          console.log(err);
        } else if (collections) {
          console.log('Available Collections', {
            collectionNames: collections.map(({ name }) => name),
          });
        }
      });
    const port = 3000;
    app
      .listen(port, () => {
        console.log(`The application is listening on http://localhost:${port}`);
      })
      .on('close', () => mongoose.disconnect());
  })
  .catch((err) => {
    console.error({ err });
  });
