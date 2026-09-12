import "server-only";

import clientPromise from "@/src/lib/mongodb";
import type { Product } from "./types";

const dbName = process.env.MONGODB_DB_NAME;

if (!dbName) {
  throw new Error("Missing MONGODB_DB_NAME environment variable");
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(dbName);

  return db.collection<Product>("products");
}

export async function getProducts(): Promise<Product[]> {
  const collection = await getCollection();

  return collection.find({}).sort({ id: 1 }).toArray();
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  const collection = await getCollection();

  return collection.findOne({ id });
}

export async function createProduct(
  product: Product
): Promise<Product> {
  const collection = await getCollection();

  await collection.insertOne(product);

  return product;
}

export async function updateProduct(
  id: string,
  product: Partial<Product>
): Promise<Product | null> {
  const collection = await getCollection();

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: product },
    { returnDocument: "after" }
  );

  return result ?? null;
}

export async function deleteProduct(
  id: string
): Promise<boolean> {
  const collection = await getCollection();

  const result = await collection.deleteOne({ id });

  return result.deletedCount === 1;
}