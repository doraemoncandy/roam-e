// import { Request, Response } from "express";

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import dotenv from "dotenv";
const express = require('express');
const Request = express.Request;
const Response = express.Response;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

// GoogleGenerativeAI required config
const configuration = new GoogleGenerativeAI(process.env.API_KEY);


// Model initialization
const modelId = "gemini-pro";
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


//#region T2S voice 

const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
// const playsound = require('play-sound');
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
    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputTxt2SpeechFile, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${outputTxt2SpeechFile}`);
    player.play(outputTxt2SpeechFile, function(err){
      if (err) throw err
    })
    res.send({ response: 'OK' });

} //end: T2S response

//#endregion voice

module.exports = { generateResponse, generateT2Sresponse };