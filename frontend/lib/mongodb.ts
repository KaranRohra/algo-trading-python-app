import "server-only";
import { MongoClient } from "mongodb";

const uri = process.env.NEXT_APP_MONGO_URI;
const client = new MongoClient(uri as string);
client.connect();
const db = client.db(process.env.NEXT_APP_MONGO_DB as string);

export const usersCollection = db.collection("users");
export const logsCollection = db.collection("logs");
export const envCollection = db.collection("environment");
