import { createHash } from "crypto";
import "dotenv/config";

/**
 * The one place the real ElevenLabs voice id is resolved. Both generate-audio
 * and build-props must agree, or cache keys diverge and every lookup misses.
 * spec.voice is a logical label ("narrator-primary"), never an api id, so
 * a missing env var is a hard error rather than a silent fallback.
 */
export function resolveVoiceId(spec) {
  const id = process.env.ELEVENLABS_VOICE_ID;
  if (!id) {
    throw new Error(
      `ELEVENLABS_VOICE_ID is not set in .env.\n` +
      `  The spec's voice field ("${spec.voice}") is a logical label, not an ElevenLabs voice id.\n` +
      `  Add ELEVENLABS_VOICE_ID=<id> to .env and re-run.`
    );
  }
  return id;
}

export const AUDIO_DIR = "public/audio";
export const MODEL_ID = "eleven_multilingual_v2";

/**
 * Cache key for a narration line. Any change to the text, voice, or model
 * produces a new key; identical lines across variants share one file.
 */
export function audioKey(narration, voiceId, modelId = MODEL_ID) {
  return createHash("sha256")
    .update(`${modelId}\u0000${voiceId}\u0000${narration}`)
    .digest("hex")
    .slice(0, 16);
}

export const mp3Path = (key) => `${AUDIO_DIR}/${key}.mp3`;
export const alignPath = (key) => `${AUDIO_DIR}/${key}.align.json`;

/** Path a Remotion staticFile() call needs, i.e. relative to public/. */
export const publicAudioRef = (key) => `audio/${key}.mp3`;

/** Every distinct narration line a spec needs, keyed by cache key. */
export function planAudio(spec, voiceId) {
  const plan = new Map();
  const add = (step) => {
    if (!step?.narration) return;
    const key = audioKey(step.narration, voiceId);
    if (!plan.has(key)) plan.set(key, { key, narration: step.narration, usedBy: [] });
    plan.get(key).usedBy.push(step.id);
  };
  spec.steps.forEach(add);
  for (const v of spec.variants) {
    add(v.hook);
    add(v.cta);
    for (const [sid, narration] of Object.entries(v.narrationOverrides ?? {})) {
      add({ id: `${v.id}/${sid}`, narration });
    }
  }
  return plan;
}
