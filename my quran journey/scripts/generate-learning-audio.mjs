import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(appRoot, 'assets', 'audio');

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

if (!apiKey) {
  throw new Error('ELEVENLABS_API_KEY is not set. Audio generation was not run.');
}

const letterPrompts = [
  ['letters/alif', 'Alif. Listen, then say Alif.'],
  ['letters/ba', 'Ba. Listen, then say Ba.'],
  ['letters/ta', 'Ta. Listen, then say Ta.'],
  ['letters/tha', 'Tha. Listen, then say Tha.'],
  ['letters/jeem', 'Jeem. Listen, then say Jeem.'],
  ['letters/ha', 'Haa. A gentle throat sound. Listen, then say Haa.'],
  ['letters/kha', 'Kha. A soft throat sound. Listen, then say Kha.'],
  ['letters/dal', 'Dal. Listen, then say Dal.'],
  ['letters/dhal', 'Dhal. Listen, then say Dhal.'],
  ['letters/ra', 'Ra. Listen, then say Ra.'],
  ['letters/zay', 'Zay. Listen, then say Zay.'],
  ['letters/seen', 'Seen. Listen, then say Seen.'],
  ['letters/sheen', 'Sheen. Listen, then say Sheen.'],
  ['letters/sad', 'Sad. A heavier sound. Listen, then say Sad.'],
  ['letters/dad', 'Dad. A special Arabic sound. Practice with a teacher too.'],
  ['letters/tah', 'Tah. A firm sound. Listen, then say Tah.'],
  ['letters/zah', 'Zah. A heavier sound. Listen, then say Zah.'],
  ['letters/ayn', 'Ayn. A gentle throat sound. Listen, then try slowly.'],
  ['letters/ghayn', 'Ghayn. A smooth throat sound. Listen, then try slowly.'],
  ['letters/fa', 'Fa. Listen, then say Fa.'],
  ['letters/qaf', 'Qaf. A deep sound. Listen, then say Qaf.'],
  ['letters/kaf', 'Kaf. Listen, then say Kaf.'],
  ['letters/lam', 'Lam. Listen, then say Lam.'],
  ['letters/meem', 'Meem. Listen, then say Meem.'],
  ['letters/noon', 'Noon. Listen, then say Noon.'],
  ['letters/haa', 'Haa. Listen, then say Haa.'],
  ['letters/waw', 'Waw. Listen, then say Waw.'],
  ['letters/ya', 'Ya. Listen, then say Ya.'],
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

  if (await exists(filePath)) {
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
