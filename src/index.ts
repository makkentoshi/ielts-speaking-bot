import { Bot, session, Context, SessionFlavor, InlineKeyboard } from "grammy";
import { conversations, ConversationFlavor } from "@grammyjs/conversations";
import { run } from "@grammyjs/runner";
import { config } from "./config";
import { setupIeltsBot } from "./ielts";
import { setupSpanishBot } from "./spanish";
import { db, getSessionStorage } from "./database";
import { userMiddleware } from "./middlewares";
import { ExamSession, SessionData } from "./interfaces";

// Extend BotContext to include session and conversation flavors
type BotContext = Context &
  SessionFlavor<SessionData> &
  ConversationFlavor<Context>;

async function bootstrap() {
  // Initialize database
  await db.connect();
  await db.ensureIndexes();

  // Create bot
  const bot = new Bot<BotContext>(config.BOT_TOKEN);

  // Middleware (session must come first)
  bot.use(
    session({
      initial: (): SessionData => ({}),
      storage: getSessionStorage(),
    })
  );
  bot.use(conversations());
  bot.use(userMiddleware);

  // Debug middleware
  bot.use(async (ctx, next) => {
    console.log("Received update:", ctx.update);
    await next();
  });

  // Register start command
  bot.command("start", async (ctx) => {
    await ctx.reply(`🌟 Welcome to Language Learning Bot! 🌟

I can help you with:
- IELTS Speaking practice and assessment 🇬🇧
- Spanish language learning 🇪🇸

Use these commands:
/assess_speaking - Start IELTS speaking practice
/spanish - Spanish learning menu

Send a voice message during IELTS practice to have your speaking assessed.`);
  });

  // Register assess_speaking command
  bot.command("assess_speaking", async (ctx) => {
    // Initialize exam session
    ctx.session.exam = {
      topic: "",
      part: 0,
      answers: [],
      questionIndex: 0,
      page: 0,
    };

    // Trigger IELTS topic selection menu
    const keyboard = new InlineKeyboard();
    const TOPICS_PER_PAGE = 5;
    const topics = [
      "Work",
      "Study",
      "Hometown",
      "Family",
      "Friends",
      "Food",
      "Travel",
      "Sports",
      "Music",
      "Movies",
      "Books",
      "Technology",
      "Health",
      "Shopping",
      "Environment",
      "Art",
      "Daily Routine",
      "Weather",
      "Future Plans",
      "Hobbies",
    ].slice(0, TOPICS_PER_PAGE);

    topics.forEach((topic) => {
      keyboard.text(topic, `topic_${topic}`).row();
    });
    keyboard.text("Random Topic", "topic_Random").row();
    keyboard.text("Next ➡️", "page_1");

    await ctx.reply("📝 Choose an IELTS Speaking topic:", {
      reply_markup: keyboard,
    });
  });

  // Setup features
  setupIeltsBot(bot);
  setupSpanishBot(bot);

  // Fallback for unhandled messages
  bot.on("message", async (ctx) => {
    console.log("Unhandled message:", ctx.message.text);
    await ctx.reply(
      "I didn't understand that. Please use /start to see available commands."
    );
  });

  // Error handling
  bot.catch(async (err) => {
    console.error("Bot error:", err);

    if (err.ctx) {
      try {
        await err.ctx.reply(
          "⚠️ Service error occurred. Please try again later."
        );
      } catch (e) {
        console.error("Failed to send error message:", e);
      }
    }

    // Specific handling for DeepSeek errors
    if (err.message.includes("DeepSeek")) {
      console.error("DeepSeek API failure:", err);
      // Potentially implement retry logic here
    }
  });

  // Start bot
  console.log(
    "Starting bot with token:",
    config.BOT_TOKEN?.substring(0, 10) + "..."
  );
  await bot.init();
  console.log("Bot initialized!");
  run(bot);
  console.log("Bot runner started!");
}

bootstrap().catch((err) => {
  console.error("Bot startup failed:", err);
  process.exit(1);
});
