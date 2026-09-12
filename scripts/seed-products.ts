import { MongoClient } from "mongodb";
import { products } from "../src/data/products";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error("Missing MONGODB_URI");
}

if (!dbName) {
  throw new Error("Missing MONGODB_DB_NAME");
}

async function seedProducts() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection("products");

    await collection.deleteMany({});

    await collection.insertMany(products);

    console.log(`Inserted ${products.length} products`);
  } finally {
    await client.close();
  }
}

seedProducts().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});