"use server";

import { neon } from "@neondatabase/serverless";

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS "sentinel.emails" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "email" TEXT NOT NULL UNIQUE
  );
`;

const insertIntoTableSQL = `
  INSERT INTO "sentinel.emails" (email) VALUES ($1);
`;

export const subscribeEmailUsingNeonDB = async (
  email: string
): Promise<boolean> => {
  try {
    console.log(process.env.DATABASE_URL);
    const sql = neon(`${process.env.DATABASE_URL}`);
    const __ = await sql(createTableSQL);
    const _ = await sql(insertIntoTableSQL, [email]);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
