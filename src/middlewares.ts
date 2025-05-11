import { Context, NextFunction } from "grammy";
import { db } from "./database";
import { User } from "./interfaces";
import { WithId } from "mongodb";

export async function userMiddleware(ctx: Context, next: NextFunction) {
  if (!ctx.from) return next();

  const userId = ctx.from.id;
  let user = await db.users.findOne({ userId });

  if (!user) {
    const newUser: User = {
      userId,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      language: "english", // default
      dailyPhraseEnabled: false,
    };
    const result = await db.users.insertOne(newUser);
    user = { _id: result.insertedId, ...newUser };
  }

  (ctx as any).user = user;
  return next();
}
