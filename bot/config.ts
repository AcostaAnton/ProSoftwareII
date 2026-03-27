import dotenv from 'dotenv'

dotenv.config()

export const config = {
  bot: {
    token: process.env.BOT_TOKEN || '',
    name: process.env.BOT_NAME || 'PasaYa',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  environment: process.env.NODE_ENV || 'development',
}

if (!config.bot.token || !config.supabase.url || !config.supabase.serviceRoleKey) {
  console.warn('⚠️  Faltan variables de entorno (BOT_TOKEN o Supabase). Configure el archivo .env.')
}
