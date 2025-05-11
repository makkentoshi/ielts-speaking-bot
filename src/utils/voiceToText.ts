import { BotContext } from "../interfaces";
import fs from "fs";
import fetch from "node-fetch";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { config } from "../config";

ffmpeg.setFfmpegPath(ffmpegStatic as string);

export async function convertVoiceToText(ctx: BotContext): Promise<string> {
  const file = await ctx.getFile();
  const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`;
  const oggPath = `./temp_${ctx.from!.id}.ogg`;
  const mp3Path = `./temp_${ctx.from!.id}.mp3`;

  // Download audio
  const response = await fetch(fileUrl);
  await new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(oggPath);
    response.body?.pipe(fileStream);
    fileStream.on("finish", resolve);
    fileStream.on("error", reject);
  });

  // Convert to MP3
  await new Promise((resolve, reject) => {
    ffmpeg(oggPath)
      .toFormat("mp3")
      .on("end", resolve)
      .on("error", reject)
      .save(mp3Path);
  });

  // Placeholder for local speech-to-text
  // TODO: Integrate with a model like Whisper
  const transcription = "This is a placeholder transcription. Replace with actual speech-to-text output.";

  // Cleanup
  fs.unlinkSync(oggPath);
  fs.unlinkSync(mp3Path);

  return transcription;
}