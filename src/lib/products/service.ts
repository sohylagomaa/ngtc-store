import "server-only";

import clientPromise from "@/src/lib/mongodb";
import type { Product } from "./types";
import { ObjectId } from "mongodb";

const dbName = process.env.MONGODB_DB_NAME;

if (!dbName) {
  throw new Error("Missing MONGODB_DB_NAME environment variable");
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(dbName);

  return db.collection("products");
}

function mapProduct(product: any): Product {
  return {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    weight: product.weight,
    category: product.category,
    image: product.image,
    description: product.description,
    chefRecommendations: product.chefRecommendations,
  };
}

export async function getProducts(): Promise<Product[]> {
  const collection = await getCollection();

  const products = await collection.find({}).toArray();

  return products.map(mapProduct);
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  const product = await collection.findOne({
    _id: new ObjectId(id),
  });

  return product ? mapProduct(product) : null;
}

export async function createProduct(
  product: Omit<Product, "_id">
): Promise<Product> {
  const collection = await getCollection();

  const result = await collection.insertOne(product);

  return {
    _id: result.insertedId.toString(),
    ...product,
  };
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, "_id">>
): Promise<Product | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: product },
    { returnDocument: "after" }
  );

  return result ? mapProduct(result) : null;
}

export async function deleteProduct(
  id: string
): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const collection = await getCollection();

  const result = await collection.deleteOne({
    _id: new ObjectId(id),
  });

  return result.deletedCount === 1;
}