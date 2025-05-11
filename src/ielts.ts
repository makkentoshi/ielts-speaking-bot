import { Bot, Context, Keyboard, InlineKeyboard } from "grammy";
import { IELTS_TOPICS, QUESTIONS, IeltsTopic } from "./ielts-topics";
import { ExamSession, BotContext } from "./interfaces";
import { config } from "./config";
import { convertVoiceToText } from "./utils/voiceToText";
import OpenAI from "openai";

// Initialize DeepSeek
const deepseek = new OpenAI({
  baseURL: config.DEEPSEEK_BASE_URL,
  apiKey: config.DEEPSEEK_API_KEY,
});

// Pagination constants
const TOPICS_PER_PAGE = 5;

// Setup IELTS bot
export function setupIeltsBot(bot: Bot<BotContext>) {
  // Start IELTS exam
  bot.command("ielts_exam", async (ctx) => {
    ctx.session.exam = {
      topic: "",
      part: 0,
      answers: [],
      questionIndex: 0,
      page: 0,
    };
    await displayTopicMenu(ctx, 0);
  });

  // Handle topic selection and navigation
  bot.callbackQuery(/topic_(.+)/, async (ctx) => {
    const topic = ctx.match[1];
    if (topic === "Random") {
      const randomTopic = IELTS_TOPICS[
        Math.floor(Math.random() * (IELTS_TOPICS.length - 1))
      ] as IeltsTopic;
      ctx.session.exam!.topic = randomTopic;
    } else {
      ctx.session.exam!.topic = topic as IeltsTopic;
    }
    ctx.session.exam!.part = 1;
    await ctx.answerCallbackQuery();
    await startPart1(ctx);
  });

  bot.callbackQuery(/page_(\d+)/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    ctx.session.exam!.page = page;
    await ctx.answerCallbackQuery();
    await displayTopicMenu(ctx, page);
  });

  // Handle voice messages
  bot.on("message:voice", async (ctx) => {
    if (!ctx.session.exam || ctx.session.exam.part === 0) return;

    try {
      await ctx.reply("🔍 Analyzing your response...");

      // Convert voice to text
      const text = await convertVoiceToText(ctx);
      if (!text) throw new Error("Could not process audio");

      // Save answer
      ctx.session.exam.answers.push(text);

      // Process the response
      await processResponse(ctx, text);
    } catch (error) {
      console.error("Exam error:", error);
      await ctx.reply("⚠️ Error processing your response. Please try again.");
    }
  });

  // Cancel exam
  bot.hears("Cancel Exam", async (ctx) => {
    if (ctx.session.exam) {
      delete ctx.session.exam;
      await ctx.reply("❌ Exam cancelled. Start again with /ielts_exam");
    }
  });

  bot.command("cancel", async (ctx) => {
    if (ctx.session.exam) {
      delete ctx.session.exam;
      await ctx.reply("❌ Exam cancelled. Start again with /ielts_exam");
    }
  });
}

async function displayTopicMenu(ctx: BotContext, page: number) {
  const start = page * TOPICS_PER_PAGE;
  const end = start + TOPICS_PER_PAGE;
  const topics = IELTS_TOPICS.slice(start, end);

  const keyboard = new InlineKeyboard();
  topics.forEach((topic) => {
    keyboard.text(topic, `topic_${topic}`).row();
  });
  keyboard.text("Random Topic", "topic_Random").row();

  // Navigation buttons
  if (page > 0) {
    keyboard.text("⬅️ Previous", `page_${page - 1}`);
  }
  if (end < IELTS_TOPICS.length) {
    keyboard.text("Next ➡️", `page_${page + 1}`);
  }

  await ctx.reply("📝 Choose an IELTS Speaking topic:", {
    reply_markup: keyboard,
  });
}

async function startPart1(ctx: BotContext) {
  const topic = ctx.session.exam!.topic as IeltsTopic;
  ctx.session.exam!.questionIndex = 0;

  await ctx.reply(
    `🗣️ <b>Part 1: Introduction and Interview</b>\n\n` +
      `You can cancel the exam at any time by clicking "Cancel Exam" or typing /cancel.\n\n` +
      `${QUESTIONS[topic].part1[0]}`,
    {
      parse_mode: "HTML",
      reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
    }
  );
}

async function processResponse(ctx: BotContext, answer: string) {
  const exam = ctx.session.exam!;
  const topic = exam.topic as IeltsTopic;

  // Get feedback from DeepSeek
  const feedback = await getDeepSeekFeedback(
    topic,
    answer,
    exam.part,
    exam.answers
  );
  await ctx.reply(`💬 <b>Part ${exam.part} Feedback:</b>\n${feedback}`, {
    parse_mode: "HTML",
  });

  switch (exam.part) {
    case 1:
      exam.questionIndex++;
      if (exam.questionIndex < QUESTIONS[topic].part1.length) {
        await ctx.reply(QUESTIONS[topic].part1[exam.questionIndex], {
          reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
        });
      } else {
        exam.part = 2;
        await ctx.reply(
          `🎤 <b>Part 2: Long Turn</b>\n\n${QUESTIONS[topic].part2}\n\n` +
            `You have 1 minute to prepare. Please record your response.`,
          {
            parse_mode: "HTML",
            reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
          }
        );
      }
      break;

    case 2:
      exam.part = 3;
      exam.questionIndex = 0;
      const firstQuestion = await getContextualPart3Question(
        topic,
        answer,
        QUESTIONS[topic].part3[0]
      );
      await ctx.reply(`🗣️ <b>Part 3: Discussion</b>\n\n${firstQuestion}`, {
        parse_mode: "HTML",
        reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
      });
      break;

    case 3:
      exam.questionIndex++;
      if (exam.questionIndex < 3) {
        // 3-4 questions for Part 3
        const nextQuestion = await getContextualPart3Question(
          topic,
          answer,
          QUESTIONS[topic].part3[exam.questionIndex] || ""
        );
        await ctx.reply(nextQuestion, {
          parse_mode: "HTML",
          reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
        });
      } else {
        const overallFeedback = await getOverallAssessment(exam.answers);
        await ctx.reply(`🏆 <b>Exam Completed!</b>\n\n${overallFeedback}`, {
          parse_mode: "HTML",
        });
        delete ctx.session.exam;
      }
      break;
  }
}

async function getDeepSeekFeedback(
  topic: string,
  answer: string,
  part: number,
  previousAnswers: string[]
): Promise<string> {
  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `You are an IELTS examiner. Analyze this Part ${part} response about ${topic}. 
        - Point out grammatical, lexical, or pronunciation errors (if detectable from text).
        - Suggest specific improvements to maximize the band score.
        - Provide a corrected version of the response targeting a Band 8-9.
        - Estimate the band score (1-9) for Fluency, Coherence, Lexical Resource, Grammar, and Pronunciation.
        - Consider previous answers: ${previousAnswers.join("\n\n---\n\n")}`,
      },
      { role: "user", content: answer },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content ?? "No feedback available";
}

async function getContextualPart3Question(
  topic: string,
  lastAnswer: string,
  fallbackQuestion: string
): Promise<string> {
  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `You are an IELTS examiner creating a Part 3 question for the topic "${topic}". 
        - The question must be relevant to the user's last answer: "${lastAnswer}".
        - If the answer mentions specific objects or experiences (e.g., restaurants), generate a related question (e.g., about food or dining).
        - The question should be complex, encouraging discussion (e.g., advantages/disadvantages, societal impacts).
        - If unable to generate a relevant question, use the fallback: "${fallbackQuestion}".`,
      },
      { role: "user", content: lastAnswer },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  const question =
    response.choices[0].message.content?.trim() ?? fallbackQuestion;
  return question;
}

async function getOverallAssessment(answers: string[]): Promise<string> {
  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `You are an IELTS examiner. Provide an overall assessment for these answers:
        - Fluency and Coherence (1-9)
        - Lexical Resource (1-9)
        - Grammatical Range and Accuracy (1-9)
        - Pronunciation (1-9)
        - Overall Band (1-9)
        - Detailed feedback with strengths and areas for improvement`,
      },
      { role: "user", content: answers.join("\n\n---\n\n") },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0].message.content ?? "No assessment available";
}
