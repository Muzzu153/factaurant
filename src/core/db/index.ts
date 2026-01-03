import { drizzle } from 'drizzle-orm/node-postgres'
import {Pool} from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL;

if(!connectionString){
    console.log(connectionString)
    // throw new Error('X Database URL is missing in .env')
}


const pool = new Pool({connectionString})

export const db = drizzle(pool, {schema})
