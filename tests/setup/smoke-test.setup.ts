import dotenv from 'dotenv'
dotenv.config({ path: '.env.smoke' })
if (!process.env.DATABASE_URL?.includes('smoke_reader')) {
  throw new Error('❌ Smoke tests must use read-only DB credentials')
}


console.log('🔥 SMOKE TEST MODE')
console.log('DB:', process.env.DATABASE_URL?.split('@')[1])