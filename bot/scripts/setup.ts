/**
 * Script para crear/actualizar la configuración inicial del bot
 * Ejecutar: npx ts-node bot/scripts/setup.ts
 */

import dotenv from 'dotenv'
import { initSupabase } from '../services/supabase'

dotenv.config({ path: 'bot/.env' })

async function setup() {
  console.log('🚀 Iniciando configuración del bot PasaYa...\n')

  try {
    // 1. Verificar Supabase
    console.log('1️⃣  Verificando conexión a Supabase...')
    const supabase = initSupabase()

    const { data, error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      throw new Error(`No se puede conectar a Supabase: ${error.message}`)
    }

    console.log('✅ Conexión a Supabase exitosa\n')

    // 2. Verificar tablas
    console.log('2️⃣  Verificando tablas necesarias...')

    const requiredTables = ['user_pins', 'telegram_users']

    for (const table of requiredTables) {
      const { error: tableError } = await supabase.from(table).select('id').limit(1)

      if (tableError?.code === 'PGRST116') {
        console.warn(`⚠️  Tabla ${table} no existe. Corre la migración SQL.`)
      } else if (tableError) {
        console.warn(`⚠️  Error verificando ${table}: ${tableError.message}`)
      } else {
        console.log(`✅ Tabla ${table} existe`)
      }
    }

    console.log('\n3️⃣  Verificando configuración de bot...')

    if (!process.env.BOT_TOKEN) {
      throw new Error('BOT_TOKEN no está definido en .env')
    }

    console.log(`✅ BOT_TOKEN está configurado`)
    console.log(`✅ BOT_NAME: ${process.env.BOT_NAME || 'PasaYa'}`)

    console.log('\n✨ Configuración completada exitosamente!')
    console.log('\n📝 Próximos pasos:')
    console.log('1. Ejecuta: npm run bot:dev')
    console.log('2. Los usuarios deben configurar su PIN en la app web')
    console.log('3. Luego pueden usar @PasaYa_Bot en Telegram\n')
  } catch (error) {
    console.error('❌ Error en la configuración:', error)
    process.exit(1)
  }
}

setup()
