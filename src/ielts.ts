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
      await ctx.reply("🔍 Processing your response...");

      // Convert voice to text
      const text = await convertVoiceToText(ctx);
      if (!text) throw new Error("Could not process audio");

      // Show transcription immediately
      await ctx.reply(`📜 Your response: "${text}"`);

      // Save answer
      ctx.session.exam.answers.push(text);

      // Process the response (move to next question or analyze part)
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
      await ctx.reply("❌ Exam cancelled. Start again with /assess_speaking");
    }
  });

  bot.command("cancel", async (ctx) => {
    if (ctx.session.exam) {
      delete ctx.session.exam;
      await ctx.reply("❌ Exam cancelled. Start again with /assess_speaking");
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
    `🗣️ Part 1: Introduction and Interview\n\n` +
      `You can cancel the exam at any time by clicking "Cancel Exam" or typing /cancel.\n\n` +
      `${QUESTIONS[topic].part1[0]}`,
    {
      reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
    }
  );
}

async function processResponse(ctx: BotContext, answer: string) {
  const exam = ctx.session.exam!;
  const topic = exam.topic as IeltsTopic;

  switch (exam.part) {
    case 1:
      exam.questionIndex++;
      if (exam.questionIndex < QUESTIONS[topic].part1.length) {
        // Ask next question
        await ctx.reply(QUESTIONS[topic].part1[exam.questionIndex], {
          reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
        });
      } else {
        // Analyze Part 1
        const part1Feedback = await getDeepSeekFeedback(topic, exam.answers, 1);
        await ctx.reply(`💬 Part 1 Feedback:\n${part1Feedback}`);

        // Move to Part 2
        exam.part = 2;
        exam.answers = []; // Clear answers for Part 2
        exam.questionIndex = 0;
        await ctx.reply(
          `🎤 Part 2: Long Turn\n\n${QUESTIONS[topic].part2}\n\n` +
            `You have 1 minute to prepare. Please record your response.`,
          { reply_markup: new Keyboard().text("Cancel Exam").oneTime() }
        );
      }
      break;

    case 2:
      // Analyze Part 2
      const part2Feedback = await getDeepSeekFeedback(topic, [answer], 2);
      await ctx.reply(`💬 Part 2 Feedback:\n${part2Feedback}`);

      // Move to Part 3
      exam.part = 3;
      exam.answers = []; // Clear answers for Part 3
      exam.questionIndex = 0;
      const firstQuestion = await getContextualPart3Question(
        topic,
        answer,
        QUESTIONS[topic].part3[0]
      );
      await ctx.reply(`🗣️ Part 3: Discussion\n\n${firstQuestion}`, {
        reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
      });
      break;

    case 3:
      exam.questionIndex++;
      if (exam.questionIndex < 3) {
        // Ask next contextual question
        const nextQuestion = await getContextualPart3Question(
          topic,
          answer,
          QUESTIONS[topic].part3[exam.questionIndex] || ""
        );
        await ctx.reply(nextQuestion, {
          reply_markup: new Keyboard().text("Cancel Exam").oneTime(),
        });
      } else {
        // Analyze Part 3 and complete exam
        const part3Feedback = await getDeepSeekFeedback(topic, exam.answers, 3);
        const overallFeedback = await getOverallAssessment(exam.answers);
        await ctx.reply(
          `💬 Part 3 Feedback:\n${part3Feedback}\n\n🏆 Exam Completed!\n\n${overallFeedback}`
        );
        delete ctx.session.exam;
      }
      break;
  }
}

async function getDeepSeekFeedback(
  topic: string,
  answers: string[],
  part: number
): Promise<string> {
  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `You are a strict IELTS examiner assessing a Part ${part} response on the topic "${topic}". Follow these guidelines:
        - Analyze the response for Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation (inferred from text).
        - Identify specific errors (e.g., grammar mistakes, limited vocabulary, lack of coherence).
        - Suggest precise improvements to achieve a Band 8-9.
        - Provide a corrected version of the response targeting Band 8-9.
        - Assign band scores (1-9) for each criterion based on IELTS rubrics:
          - Fluency: Penalize hesitations, short answers, or lack of development.
          - Coherence: Penalize disorganized or incomplete ideas.
          - Lexical Resource: Penalize basic or repetitive vocabulary.
          - Grammar: Penalize errors or overly simple structures.
          - Pronunciation: Infer from text; penalize unclear or repetitive phrasing.
        - Be strict: A short, vague response like "I work on some stuff" should score 4-5 due to lack of detail, basic vocabulary, and limited grammar.
        - Overall band is the average of the four criteria.
        - Format feedback clearly without Markdown (** or ##). Use plain text with sections: Errors, Improvements, Corrected Response, Band Scores.
        - If multiple answers are provided (e.g., Part 1), analyze them collectively.`,
      },
      { role: "user", content: answers.join("\n\n---\n\n") },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content ?? "No feedback available.";
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
        content: `You are a strict IELTS examiner providing an overall assessment for a full IELTS Speaking test. Analyze all answers:
        - Assign band scores (1-9) for:
          - Fluency and Coherence
          - Lexical Resource
          - Grammatical Range and Accuracy
          - Pronunciation (inferred from text)
        - Calculate the overall band as the average of the four criteria.
        - Provide detailed feedback on strengths and areas for improvement.
        - Be strict: Short, vague answers (e.g., "I work on some stuff") should score 4-5.
        - Format without Markdown (** or ##). Use plain text with sections: Band Scores, Feedback.`,
      },
      { role: "user", content: answers.join("\n\n---\n\n") },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0].message.content ?? "No assessment available.";
}
