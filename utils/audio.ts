const AUDIO_ENABLED = false;

/**
 * Decodes a base64 string into a Uint8Array.
 * Required for processing Gemini API audio responses.
 */
export function decodeBase64(base64: string): Uint8Array {
  if (!AUDIO_ENABLED) throw new Error("Audio processing is currently disabled.");
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data (Int16) into an AudioBuffer.
 * Gemini TTS returns raw PCM data without headers.
 */
export async function decodePcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  if (!AUDIO_ENABLED) throw new Error("Audio processing is currently disabled.");
  // Convert Uint8Array to Int16Array (since Gemini returns raw PCM 16-bit)
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize Int16 range (-32768 to 32767) to Float32 range (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
