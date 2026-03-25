import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.from('visits').select('id, resident_id, created_by, profiles!created_by(name)').limit(5)
  console.log("Error:", error)
  console.log("Data:", JSON.stringify(data, null, 2))
}
test()
