import { drizzle } from 'drizzle-orm/node-postgres'
import {Pool} from 'pg'
import * as schema from './schema'
// import { env } from '../runtime/env';

const connectionString = process.env.DATABASE_URL;

if(!connectionString){
    console.log(connectionString)
    // throw new Error('X Database URL is missing in .env')
}

console.log(connectionString)

const pool = new Pool({connectionString})

export const db = drizzle(pool, {schema})
