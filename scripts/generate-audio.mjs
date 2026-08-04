import { ElevenLabsClient } from "elevenlabs";
import { writeFileSync, existsSync } from "fs";
import 'dotenv/config';
import { steps } from "../src/content/steps.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY — check your .env file");
  process.exit(1);
}

const voiceId = process.env.ELEVENLABS_VOICE_ID;
const client = new ElevenLabsClient({ apiKey });
const force = process.argv.includes("--force");

for (const step of steps) {
  const mp3Path = `public/${step.id}.mp3`;

  if (existsSync(mp3Path) && !force) {
    console.log(`Skip  ${step.id}  (exists — use --force to regenerate)`);
    continue;
  }

  const response = await client.textToSpeech.convertWithTimestamps(voiceId, {
    text: step.narration,
    model_id: "eleven_multilingual_v2",
  });

  writeFileSync(mp3Path, Buffer.from(response.audio_base64, "base64"));
  writeFileSync(`public/${step.id}-alignment.json`, JSON.stringify(response.alignment, null, 2));
  console.log(`Built ${step.id}`);
}