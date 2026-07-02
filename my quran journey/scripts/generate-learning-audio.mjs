import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(appRoot, 'assets', 'audio');

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const forceRegenerate = process.argv.includes('--force') || process.env.AUDIO_REGENERATE === '1';

if (!apiKey) {
  throw new Error('ELEVENLABS_API_KEY is not set. Audio generation was not run.');
}

const letterPrompts = [
  ['letters/alif', 'Arabic letter. Alif. Alif.'],
  ['letters/ba', 'Arabic letter. Baa. Baa.'],
  ['letters/ta', 'Arabic letter. Taa. Taa.'],
  ['letters/tha', 'Arabic letter. Thaa. Thaa.'],
  ['letters/jeem', 'Arabic letter. Jeem. Jeem.'],
  ['letters/ha', 'Arabic letter. Haa. Gentle throat sound. Haa.'],
  ['letters/kha', 'Arabic letter. Khaa. Khaa.'],
  ['letters/dal', 'Arabic letter. Daal. Daal.'],
  ['letters/dhal', 'Arabic letter. Dhaal. Dhaal.'],
  ['letters/ra', 'Arabic letter. Raa. Raa.'],
  ['letters/zay', 'Arabic letter. Zay. Zay.'],
  ['letters/seen', 'Arabic letter. Seen. Seen.'],
  ['letters/sheen', 'Arabic letter. Sheen. Sheen.'],
  ['letters/sad', 'Arabic letter. Saad. Saad.'],
  ['letters/dad', 'Arabic letter. Daad. Daad.'],
  ['letters/tah', 'Arabic letter. Taa heavy. Taa.'],
  ['letters/zah', 'Arabic letter. Zaa heavy. Zaa.'],
  ['letters/ayn', 'Arabic letter. Ayn. Ayn.'],
  ['letters/ghayn', 'Arabic letter. Ghayn. Ghayn.'],
  ['letters/fa', 'Arabic letter. Faa. Faa.'],
  ['letters/qaf', 'Arabic letter. Qaaf. Qaaf.'],
  ['letters/kaf', 'Arabic letter. Kaaf. Kaaf.'],
  ['letters/lam', 'Arabic letter. Laam. Laam.'],
  ['letters/meem', 'Arabic letter. Meem. Meem.'],
  ['letters/noon', 'Arabic letter. Noon. Noon.'],
  ['letters/haa', 'Arabic letter. Haa. Haa.'],
  ['letters/waw', 'Arabic letter. Waaw. Waaw.'],
  ['letters/ya', 'Arabic letter. Yaa. Yaa.'],
];

const practiceWordPrompts = [
  ['practice-words/bab', 'Practice word: baab. It means door. This is not Quran text.'],
  ['practice-words/qalam', 'Practice word: qalam. It means pencil. This is not Quran text.'],
  ['practice-words/najm', 'Practice word: najm. It means star. This is not Quran text.'],
  ['practice-words/zahra', 'Practice word: zahra. It means flower. This is not Quran text.'],
  ['practice-words/kitab', 'Practice word: kitaab. It means book. This is not Quran text.'],
];

const feedbackPrompts = [
  ['ui/great-job', 'Great job!'],
  ['ui/try-again', 'Try again. Listen once more.'],
  ['ui/you-found-letter', 'You found the letter!'],
  ['ui/beautiful-effort', 'Beautiful effort!'],
  ['ui/keep-practicing', 'Keep practicing. Small steps grow a garden.'],
];

const audioItems = [...letterPrompts, ...practiceWordPrompts, ...feedbackPrompts];

const exists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createSpeech = async (text) => {
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`);
  url.searchParams.set('output_format', 'mp3_44100_128');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.75,
        style: 0.2,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs request failed (${response.status}): ${errorText.slice(0, 300)}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

let generated = 0;
let skipped = 0;

for (const [key, text] of audioItems) {
  const filePath = path.join(outputRoot, `${key}.mp3`);
  await mkdir(path.dirname(filePath), { recursive: true });

  if (!forceRegenerate && await exists(filePath)) {
    skipped += 1;
    console.log(`skip ${key}`);
    continue;
  }

  const audio = await createSpeech(text);
  await writeFile(filePath, audio);
  generated += 1;
  console.log(`generated ${key}`);
  await sleep(350);
}

console.log(`Learning audio generation finished. generated=${generated} skipped=${skipped}`);
