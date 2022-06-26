import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import { connectMongoDb } from './shared/connect-db';
import { Mongoose } from 'mongoose';
import {
  getWoolworthsUrl,
  hashUrl,
  shouldReadFromBlogStorage,
  getAllLookupUrls,
} from './shared/utils';
import { deleteUrl } from './scrapper/updateLookUpTable';
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

const formatDate = (d: Date) => {
  return [
    d.getDate().toString().padStart(2, '0'),
    (d.getMonth() + 1).toString().padStart(2, '0'),
    d.getFullYear(),
  ].join('/');
};

app.get('/', async (req, res) => {
  console.log('route /');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/delete/:id', async (req) => {
  deleteUrl(req.params.id);
});

app.get('/reload/:url', async (req) => {
  console.log(req.params.url);
  await new Scraper(new Uploader()).scrap(getWoolworthsUrl(req.params.url));
});

app.get('/prerender', async (req, res) => {
  const lookupUrls: any[] = await getAllLookupUrls();
  console.log(lookupUrls);

  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const style = fs.readFileSync(
    path.join(__dirname, 'style/style.css'),
    'utf8'
  );

  let lookupUrlElement = '';
  var totalurls = lookupUrls.length;
  lookupUrls.forEach((lookupUrl) => {
    lookupUrlElement += `
        <tr>
          <td><a href="${lookupUrl.url}" target="_blank">${
      lookupUrl.url
    } </a></td>
          <td>
            <div class="view-img" ><div class="iframe"><iframe src="${
              lookupUrl.url
            }"></iframe></div><img  width="25px" height="25px" title="View" src="/style/svg/view.svg" /></div>
            <img width="25px" height="25px" title="Reload" src="/style/svg/reload.svg" onclick="(function(e){
              var xmlHttp = new XMLHttpRequest();
                xmlHttp.open('GET', 'http://localhost:3000/reload/${encodeURIComponent(
                  lookupUrl.url
                )}');
                xmlHttp.send();
                return false;
            })(this)"/>
            <img width="25px" height="25px" title="Delete" src="/style/svg/delete.svg" onclick="(
              function(e){
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open('GET', 'http://localhost:3000/delete/${
                  lookupUrl._id
                }');
                xmlHttp.send();
                document.getElementById('lookupTable').deleteRow(e.parentNode.parentNode.rowIndex);
                document.getElementById('display-text-total').innerHTML = Number(document.getElementById('display-text-total').innerText) - 1;
                return false;}
              )(this)"/>
          </td>
          <td>
          ${formatDate(new Date(lookupUrl.updatedAt))}
          </td>
          <td>
          ${formatDate(new Date(lookupUrl.expiryDate))}
          </td>
        </tr>
      `;
  });
  lookupUrlElement = `
      <div class="display-text"><b id="display-text-total">${totalurls}</b> page(s) have been cached.</div>
      <table id="lookupTable">
        <thead>
          <td>Cached pages</td>
          <td>Actions</td>
          <td>Cached date</td>
          <td>Expiry date</td>
        </thead>
      ${lookupUrlElement}</table>
      <script>

      </script>
    `;

  res.send(
    indexHtml.replace(
      '<!-- content -->',
      `<style>${style}</style>` + lookupUrlElement
    )
  );
});

app.get('*', async (req, res) => {
  console.log('route *');
  const { url } = req;
  console.log({ url });
  if (
    url.substring(url.length - 4) === '.svg' ||
    url.substring(url.length - 8) === 'logo.png'
  )
    return res.sendFile(
      path.join(__dirname, 'style/images/' + url.split('/').pop())
    );
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
