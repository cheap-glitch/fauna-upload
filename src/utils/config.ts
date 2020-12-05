import dotenv from 'dotenv';

dotenv.config();

export const secret = process.env.FAUNADB_SECRET;
