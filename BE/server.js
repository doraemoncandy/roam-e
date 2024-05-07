

const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { generateResponse } = require('./controller');

const express = require('express');
const multer  = require('multer');


dotenv.config();

const app = express();
const port = process.env.PORT;

// Use body-parser middleware
app.use(bodyParser.json());

// hello test
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post("/generate", generateResponse);

app.listen(port, () => {
  console.log('Server is running on port 3000');
});

