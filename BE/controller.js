
// Gemini 
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {VertexAI} = require('@google-cloud/vertexai');
// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: 'serene-art-421905', location: 'us-central1'});

// env 
const dotenv = require('dotenv');
dotenv.config();

//fs
const fs = require('fs');

/**
 * Mode - 
 * 1. gemini-1.5-pro-preview-0409
 * 
 */
const modelPro = 'gemini-1.5-pro-preview-0409';
const modelId = "gemini-pro";

// GoogleGenerativeAI required config
const configuration = new GoogleGenerativeAI(process.env.API_KEY);


// Model initialization

const model = configuration.getGenerativeModel({ model: modelId });

//These arrays are to maintain the history of the conversation
const conversationContext = [];
const currentMessages = [];

// Controller function to handle chat conversation
const generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Restore the previous context
    for (const [inputText, responseText] of conversationContext) {
      currentMessages.push({ role: "user", parts: inputText });
      currentMessages.push({ role: "model", parts: responseText });
    }

    const chat = model.startChat({
      history: currentMessages,
      generationConfig: {
        maxOutputTokens: 10000,
      },
    });

    const result = await chat.sendMessage(prompt);
    console.log(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Stores the conversation
    conversationContext.push([prompt, responseText]);
    res.send({ response: responseText });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "/generate API Error" });
  }
};


//#region  T2I

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: modelPro,
  generationConfig: {
    'maxOutputTokens': 8192,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [
    {
        'category': 'HARM_CATEGORY_HATE_SPEECH',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_HARASSMENT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ],
});



let generateImgContent = async (req, res) => {
  console.log('req.body',req)
  const { prompt } = req.body;
  const img = req.file; // multer 會將上傳的檔案放在 req.file

  console.log('img',img)
  

// 讀取image內容
const fileContent = fs.readFileSync(img.path);
// file content to base64
const base64Data = fileContent.toString('base64');


  const imageObj = {
    inlineData: {
      mimeType: 'image/png',
      data:base64Data
    }
  };

  const reqObj = {
    contents: [
      {role: 'user', parts: [imageObj, {text: `${prompt}`}]}
    ],
  };

  try {
    const streamingResp = await generativeModel.generateContentStream(reqObj);
    console.log('streamingResp',streamingResp);

    let response = '';
   
    response +=  JSON.stringify(await streamingResp.response);
    res.send(response); // show text
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send({ error: 'An error occurred while generating image content.' });
  }
}



//#endregion T2I


//#region voice 

//#region T2S

const textToSpeech = require('@google-cloud/text-to-speech');
const util = require('util');
const player = require('play-sound')(opts = {})
const outputTxt2SpeechFile = 'output.mp3';
const client = new textToSpeech.TextToSpeechClient();
let generateT2Sresponse = async (req, res) => {
  const { text } = req.body;

  if (!text || text.length === 0) {
    return res.status(400).json({ error: "The 'text' property cannot be empty." });
  }
  const request = {
    input: {text: text},
    voice: {languageCode: 'zh-TW', ssmlGender: 'NEUTRAL'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputTxt2SpeechFile, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${outputTxt2SpeechFile}`);
    player.play(outputTxt2SpeechFile, { stayOpen: true })

    res.send({ response: 'OK' });

} //end: T2S response

//#region  S2T

//#endregion S2T

//#endregion voice

module.exports = { generateResponse, generateT2Sresponse, generateImgContent };