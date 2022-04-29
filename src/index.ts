import express from 'express';

const app = express();

app.get('*', (req, res) => {
    res.send(`This is a test web page! ${req.url}`);
    // read look up table

})

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
})