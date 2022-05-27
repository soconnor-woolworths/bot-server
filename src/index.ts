import express from 'express';
import dotenv from 'dotenv';
import { connectMongoDb } from './connect-db';
import { Mongoose } from 'mongoose';
import { hashUrl, shouldReadFromBlogStorage } from './utils';
import { BlobReader } from './blob-reader';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

const app = express();

const blobReader = new BlobReader();

app.get('*', async (req, res) => {
  const { url } = req;
  console.log({ url });

  const hashedUrl = hashUrl(url);
  console.log({ hashedUrl });

  const readFromBlob = await shouldReadFromBlogStorage(hashedUrl);
  console.log({ readFromBlob });

  if (readFromBlob) {
    console.log('reading from blob storage');
    const content = await blobReader.getFromBlobStorage(hashedUrl);
    res.send(content);
  } else {
    res.send('url is either expired or not found in lookup table');
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
