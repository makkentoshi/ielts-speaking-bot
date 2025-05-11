import { Bot, InlineKeyboard } from "grammy";
import { db } from "./database";
import { SpanishPhrase, SpanishTense } from "./interfaces";
import { BotContext } from "./interfaces";

export function setupSpanishBot(bot: Bot<BotContext>) {
  // Spanish learning commands
  bot.command("spanish", async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text("Daily Phrase", "daily_phrase")
      .text("Verb Tenses", "verb_tenses")
      .row()
      .text("Dictionary", "dictionary")
      .text("Practice", "practice");

    await ctx.reply("🇪🇸 *Spanish Learning Menu* 🇪🇸\nChoose an option:", {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  });

  // Daily phrase handler
  bot.callbackQuery("daily_phrase", async (ctx) => {
    try {
      const phrases = await db.spanishPhrases
        .aggregate([{ $sample: { size: 1 } }])
        .toArray();

      if (phrases.length === 0) {
        await ctx.answerCallbackQuery("No phrases available");
        return;
      }

      const phrase = phrases[0];
      const message =
        `📌 *Spanish Phrase of the Day*\n\n` +
        `🇪🇸 ${phrase.phrase}\n` +
        `🇬🇧 ${phrase.translation}\n\n` +
        (phrase.example ? `💡 Example: ${phrase.example}` : "");

      await ctx.reply(message, { parse_mode: "Markdown" });
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error("Error getting daily phrase:", error);
      await ctx.answerCallbackQuery("Error getting phrase");
    }
  });

  // Verb tenses handler
  bot.callbackQuery("verb_tenses", async (ctx) => {
    try {
      const tenses = await db.spanishTenses.find().toArray();

      if (tenses.length === 0) {
        await ctx.answerCallbackQuery("No tenses available");
        return;
      }

      const keyboard = new InlineKeyboard();
      tenses.forEach((tense) => {
        keyboard.text(tense.name, `tense_${tense.name}`).row();
      });

      await ctx.reply("📚 *Spanish Verb Tenses* 📚\nSelect a tense to learn:", {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error("Error getting tenses:", error);
      await ctx.answerCallbackQuery("Error getting tenses");
    }
  });

  // Individual tense handler
  bot.callbackQuery(/^tense_/, async (ctx) => {
    try {
      const tenseName = ctx.callbackQuery.data.replace("tense_", "");
      const tense = await db.spanishTenses.findOne({ name: tenseName });

      if (!tense) {
        await ctx.answerCallbackQuery("Tense not found");
        return;
      }

      const message =
        `📖 *${tense.name}* 📖\n\n` +
        `📝 ${tense.description}\n\n` +
        `🧩 Conjugation: ${tense.conjugation}\n\n` +
        `💡 Example: ${tense.example}`;

      await ctx.reply(message, { parse_mode: "Markdown" });
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error("Error getting tense:", error);
      await ctx.answerCallbackQuery("Error getting tense");
    }
  });

  // Dictionary handler
  bot.callbackQuery("dictionary", async (ctx) => {
    await ctx.reply(
      "📖 *Spanish Dictionary*\n\nSend me any Spanish word or phrase and I will translate it for you.",
      {
        parse_mode: "Markdown",
      }
    );
    await ctx.answerCallbackQuery();
  });

  // Dictionary message handler
  bot.on("message:text", async (ctx) => {
    if (!ctx.callbackQuery && ctx.msg.text.startsWith("/")) return;

    // Check if the message is likely a dictionary query
    const text = ctx.msg.text;
    const phrases = await db.spanishPhrases
      .find({
        $or: [
          { phrase: { $regex: text, $options: "i" } },
          { translation: { $regex: text, $options: "i" } },
        ],
      })
      .limit(5)
      .toArray();

    if (phrases.length > 0) {
      let response = "🔍 *Dictionary Results* 🔍\n\n";
      phrases.forEach((phrase) => {
        response +=
          `🇪🇸 *${phrase.phrase}*\n` +
          `🇬🇧 ${phrase.translation}\n` +
          (phrase.example ? `💡 Example: ${phrase.example}\n\n` : "\n");
      });

      await ctx.reply(response, { parse_mode: "Markdown" });
    }
  });
}
