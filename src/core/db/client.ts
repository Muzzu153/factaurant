import { drizzle } from 'drizzle-orm/node-postgres'
import {Pool} from 'pg'
import * as schema from './schema'
import { env } from '../runtime/env.server';

const connectionString = env.DATABASE_URL;

if(!connectionString){
    throw new Error('X Database URL is missing in .env')
}

const pool = new Pool({connectionString})

export const db = drizzle(pool, {schema})
