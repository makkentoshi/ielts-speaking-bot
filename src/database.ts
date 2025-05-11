import { MongoClient, Db, Collection, Filter, FindOptions } from "mongodb";
import { User, SpanishPhrase, SpanishTense, SessionData } from "./interfaces";
import { config } from "./config";
import { MongoDBAdapter } from "@grammyjs/storage-mongodb";

class Database {
  private client: MongoClient;
  private db: Db | null = null;

  constructor() {
    this.client = new MongoClient(
      config.MONGODB_URI || "mongodb://localhost:27017"
    );
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db("language_bot");
    console.log("Connected to MongoDB");
  }

  get users(): Collection<User> {
    if (!this.db) throw new Error("Database not connected");
    return this.db.collection<User>("users");
  }

  get spanishPhrases(): Collection<SpanishPhrase> {
    if (!this.db) throw new Error("Database not connected");
    const collection = this.db.collection<SpanishPhrase>("spanish_phrases");
    const originalFind = collection.find.bind(collection);
    (collection as any).find = function (filter: any, options?: any) {
      console.log("spanishPhrases.find query:", { filter, options });
      return originalFind(filter, options);
    };
    return collection;
  }

  get spanishTenses(): Collection<SpanishTense> {
    if (!this.db) throw new Error("Database not connected");
    return this.db.collection<SpanishTense>("spanish_tenses");
  }

  get sessions(): Collection<SessionData> {
    if (!this.db) throw new Error("Database not connected");
    return this.db.collection<SessionData>("sessions");
  }

  async ensureIndexes(): Promise<void> {
    if (!this.db) throw new Error("Database not connected");

    try {
      // Index for users
      await this.users.createIndex({ userId: 1 }, { unique: true });
      // Index for spanishPhrases
      await this.spanishPhrases.createIndex({ category: 1 });
      // Index for spanishTenses
      await this.spanishTenses.createIndex({ name: 1 });
      // Index for sessions (for Grammy session storage)
      await this.sessions.createIndex({ key: 1 }, { unique: true });
      console.log("Indexes ensured");
    } catch (error) {
      console.error("Failed to ensure indexes:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log("MongoDB connection closed");
  }

  getDb(): Db {
    if (!this.db) throw new Error("Database not connected");
    return this.db;
  }
}

export const db = new Database();

// Session storage for Grammy
export function getSessionStorage() {
  const collection = db.getDb().collection("sessions");
  return {
    read: async (key: string) => {
      const doc = await collection.findOne({ key });
      return doc?.value ?? {};
    },
    write: async (key: string, value: any) => {
      await collection.updateOne(
        { key },
        { $set: { key, value } },
        { upsert: true }
      );
    },
    delete: async (key: string) => {
      await collection.deleteOne({ key });
    },
  };
}
