import "server-only";
import { MongoClient } from "mongodb";

const uri = process.env.NEXT_APP_MONGO_URI;
const client = new MongoClient(uri as string);
client.connect();
const db = client.db(process.env.NEXT_APP_MONGO_DB as string);

export let usersCollection = db.collection("users");
export let logsCollection = db.collection("logs");
export let envCollection = db.collection("environment");
