import { BotContext } from "../interfaces";
import fs from "fs";
import fetch from "node-fetch";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { config } from "../config";
import Whisper from "nodejs-whisper"; // Use default import

ffmpeg.setFfmpegPath(ffmpegStatic as string);

export async function convertVoiceToText(ctx: BotContext): Promise<string> {
  const file = await ctx.getFile();
  const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`;
  const oggPath = `./temp_${ctx.from!.id}.ogg`;
  const wavPath = `./temp_${ctx.from!.id}.wav`; // Whisper requires WAV

  try {
    // Download audio
    const response = await fetch(fileUrl);
    if (!response.body) throw new Error("Failed to download audio");
    await new Promise<void>((resolve, reject) => {
      const fileStream = fs.createWriteStream(oggPath);
      response.body!.pipe(fileStream);
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });

    // Convert OGG to WAV (Whisper requires WAV format)
    await new Promise((resolve, reject) => {
      ffmpeg(oggPath)
        .toFormat("wav")
        .audioChannels(1) // Mono for Whisper
        .audioFrequency(16000) // Whisper expects 16kHz
        .on("end", resolve)
        .on("error", reject)
        .save(wavPath);
    });

    // Initialize nodejs-whisper
    const whisper = new (Whisper as any)({
      modelName: "base.en", // Use English model for IELTS
      verbose: false,
      removeWavFileAfterTranscription: false, // We handle cleanup manually
    });

    // Transcribe using nodejs-whisper
    const transcription = await whisper.transcribe(wavPath);
    const text = transcription.text.trim();
    if (!text) throw new Error("Transcription failed: No text detected");

    return text;
  } catch (error) {
    console.error("Voice to text error:", error);
    throw error;
  } finally {
    // Cleanup
    if (fs.existsSync(oggPath)) fs.unlinkSync(oggPath);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
  }
}
