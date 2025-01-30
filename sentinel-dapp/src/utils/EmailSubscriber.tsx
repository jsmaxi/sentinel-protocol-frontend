"use server";

import { neon } from "@neondatabase/serverless";

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS "sentinel.emailist" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "email" TEXT NOT NULL UNIQUE,
    "datetime" timestamp
  );
`;

const insertIntoTableSQL = `
  INSERT INTO "sentinel.emailist" (email,datetime) VALUES ($1,$2);
`;

export const subscribeEmailUsingNeonDB = async (
  email: string
): Promise<boolean> => {
  try {
    console.log(process.env.DATABASE_URL);
    const sql = neon(`${process.env.DATABASE_URL}`);
    const __ = await sql(createTableSQL);
    const _ = await sql(insertIntoTableSQL, [email, new Date().toISOString()]);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
