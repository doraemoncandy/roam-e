

const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { generateResponse, generateT2Sresponse } = require('./controller');

const express = require('express');
const multer  = require('multer');
const cors = require('cors');



dotenv.config();

const app = express();
const port = process.env.PORT;

// Use body-parser middleware
app.use(bodyParser.json());
app.use(cors());

// hello test
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post("/generate", generateResponse);

app.post('/t2s', generateT2Sresponse);

app.listen(port, () => {
  console.log('Server is running on port  '  + port);
});

