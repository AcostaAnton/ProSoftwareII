import { config } from '../bot/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey)

async function checkSchema() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) {
    console.error('Error profiles:', error)
  } else {
    console.log('Sample profiles data:', JSON.stringify(data[0] || {}, null, 2))
  }

  const { data: data2, error: error2 } = await supabase.from('visits').select('*').limit(1)
  if (error2) {
      console.error('Error visits:', error2)
  } else {
      console.log('Sample visits data:', JSON.stringify(data2[0] || {}, null, 2))
  }
}

checkSchema()
