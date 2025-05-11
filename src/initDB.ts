import { db } from './database';
import { SpanishPhrase, SpanishTense } from './interfaces';

async function initDatabase() {
  try {
    await db.connect();

    // Sample Spanish phrases
    const phrases: SpanishPhrase[] = [
      {
        phrase: "Hola, ¿cómo estás?",
        translation: "Hello, how are you?",
        category: "greetings",
        example: "Hola, ¿cómo estás? - Hello, how are you?"
      },
      {
        phrase: "Mucho gusto",
        translation: "Nice to meet you",
        category: "greetings",
        example: "Mucho gusto, me llamo Juan - Nice to meet you, my name is Juan"
      },
      // Add more phrases...
    ];

    // Sample Spanish tenses
    const tenses: SpanishTense[] = [
      {
        name: "Presente",
        description: "Used for current actions or habitual actions",
        conjugation: "hablo, hablas, habla, hablamos, habláis, hablan",
        example: "Yo hablo español - I speak Spanish"
      },
      {
        name: "Pretérito perfecto",
        description: "Used for past actions that are still relevant",
        conjugation: "he hablado, has hablado, ha hablado, hemos hablado, habéis hablado, han hablado",
        example: "He comido - I have eaten"
      },
      // Add more tenses...
    ];

    // Insert data
    await db.spanishPhrases.deleteMany({});
    await db.spanishTenses.deleteMany({});
    
    await db.spanishPhrases.insertMany(phrases);
    await db.spanishTenses.insertMany(tenses);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await db.disconnect();
  }
}

initDatabase();