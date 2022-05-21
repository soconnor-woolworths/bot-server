import express from 'express';
import dotenv from 'dotenv';
import { connectMongoDb } from './connect-db';
import { Mongoose } from 'mongoose';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

const app = express();

app.get('*', (req, res) => {
  res.send(`This is a test web page! ${req.url}`);
  // read look up table
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
    app
      .listen(3000, () => {
        console.log('The application is listening on port 3000!');
      })
      .on('close', () => mongoose.disconnect());
  })
  .catch((err) => {
    console.error({ err });
  });
