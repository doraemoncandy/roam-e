const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const playsound = require('play-sound');

const client = new textToSpeech.TextToSpeechClient();

const outputFile = 'output.mp3';

const request = {
  voice: {languageCode: 'zh-TW', ssmlGender: 'FEMALE'},
  audioConfig: {audioEncoding: 'MP3'},
};

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });


readline.question('Enter the text you want to synthesize: ', (text) => {
  request.input = {text: text};

  async function synthesizeSpeech() {
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFile, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${outputFile}`);

    // Play the generated MP3 file
    playsound(outputFile);
  }

  synthesizeSpeech();

  readline.close();
});

