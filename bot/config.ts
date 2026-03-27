import dotenv from 'dotenv'

dotenv.config()

export const config = {
  bot: {
    token: process.env.BOT_TOKEN || '8765696885:AAHuiCYWsGFUuXnreJM31wQIH_gcJcxsEfU',
    name: process.env.BOT_NAME || 'PasaYa',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  environment: process.env.NODE_ENV || 'development',
}

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  console.warn('⚠️  Faltan credenciales de Supabase. Configura las variables de entorno.')
}
