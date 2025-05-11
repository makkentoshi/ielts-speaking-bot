import { MongoClient, Db, Collection } from 'mongodb';
import { User, SpanishPhrase, SpanishTense } from './interfaces';
import { config } from './config';

class Database {
  private client: MongoClient;
  private db: Db | null = null;

  constructor() {
    this.client = new MongoClient(config.MONGODB_URI);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db();
    console.log('Connected to MongoDB');
  }

  get users(): Collection<User> {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection<User>('users');
  }

  get spanishPhrases(): Collection<SpanishPhrase> {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection<SpanishPhrase>('spanish_phrases');
  }

  get spanishTenses(): Collection<SpanishTense> {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection<SpanishTense>('spanish_tenses');
  }

  async ensureIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    
    await this.users.createIndex({ userId: 1 }, { unique: true });
    await this.spanishPhrases.createIndex({ category: 1 });
    await this.spanishTenses.createIndex({ name: 1 });
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}

export const db = new Database();