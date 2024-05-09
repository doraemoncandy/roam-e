

// server package
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// upload package
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' }); // 將上傳的檔案儲存到 'uploads' 資料夾

// api functions
const { generateResponse, generateT2Sresponse, generateImgContent} = require('./controller');

// env variable 
const dotenv = require('dotenv');
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

/**
 * /generate 問問題生字
 * 
 */
app.post("/generate", generateResponse);

/**
 * / generateImg 圖+文 回覆
 * form-data
 * req.body: {
  *  prompt: string,
  *  img: file
 * }
 */
app.post('/generateImg', upload.single('img'), generateImgContent);


/**
 * /t2s 文字轉語音
 */
app.post('/t2s', generateT2Sresponse);




app.listen(port, () => {
  console.log('Server is running on port  '  + port);
});

