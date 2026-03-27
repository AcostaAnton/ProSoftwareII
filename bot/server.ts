import { Telegraf, Context } from 'telegraf'
import { Message } from 'telegraf/types'
import { config } from './config'
import { initSupabase } from './services/supabase'
import { getUserSession, clearUserSession, setUserStep, showLoginPrompt, showVisitForm, setUserData } from './handlers/session.handler'
import { handleAuthFlow, handleNewVisitFlow } from './handlers/input.handler'
import { handleConfirmVisit, handleCancelVisit } from './handlers/confirm.handler'
import { handleShowVisits } from './handlers/menu.handler'

// Inicializar bot
const bot = new Telegraf(config.bot.token)

// Inicializar Supabase
initSupabase()

// Middlewares
bot.use((ctx, next) => {
  // Logging seguro con type guards
  const logMessage = ctx.message && 'text' in ctx.message ? ctx.message.text :
                    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : 'N/A'
  console.log(`[${new Date().toISOString()}] Mensaje de usuario ${ctx.from?.id}: ${logMessage}`)
  return next()
})

// Comandos
bot.start(async (ctx) => {
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('❌ Error: No se pudo identificar tu usuario.')
    return
  }

  clearUserSession(userId)

  const welcomeMessage =
    `👋 *¡Bienvenido a ${config.bot.name}!*\n\n` +
    `🏠 Soy tu asistente para gestionar visitas a tu comunidad.\n\n` +
    `🔐 Para acceder, necesito que ingreses las mismas credenciales que usas en ProSoftware:\n` +
    `  • Tu correo electrónico\n` +
    `  • Tu contraseña`

  await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' })

  setUserStep(userId, 'email_input')
  await showLoginPrompt(ctx)
})

bot.command('cancel', async (ctx) => {
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('❌ Error: No se pudo procesar tu solicitud.')
    return
  }

  clearUserSession(userId)
  await ctx.reply('❌ Operación cancelada.\n\n/start para comenzar de nuevo.')
})

bot.command('skip', (ctx) => {
  // El comando skip es manejado por handleNewVisitFlow
})

bot.command('today', (ctx) => {
  // El comando today es manejado por handleNewVisitFlow
})

bot.command('confirmar', async (ctx) => {
  await handleConfirmVisit(ctx)
})

bot.command('cancelar', async (ctx) => {
  await handleCancelVisit(ctx)
})

bot.command('logout', async (ctx) => {
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('❌ Error: No se pudo procesar tu solicitud.')
    return
  }

  clearUserSession(userId)
  await ctx.reply('👋 ¡Hasta luego!\n\nUsa /start para volver a conectarte.')
})

// Manejo de mensajes de texto
bot.on('text', async (ctx) => {
  const userId = ctx.from?.id
  const message = ctx.message

  // Verificar que sea un mensaje de texto
  if (!userId || !message || !('text' in message)) {
    return ctx.reply('❌ Mensaje no válido. Por favor envía un mensaje de texto.')
  }

  const text = message.text

  const session = getUserSession(userId)
  const step = session.step

  // Autenticación (Email y Contraseña)
  if (step === 'email_input' || step === 'password_input') {
    await handleAuthFlow(ctx)
    return
  }

  // Main Menu
  if (step === 'main_menu') {
    if (text === '➕ Nueva Visita' || text === '/new') {
      await showVisitForm(ctx)
      return
    }

    if (text === '📋 Mis Visitas') {
      await handleShowVisits(ctx)
      return
    }

    if (text === '❌ Salir' || text === '/logout') {
      clearUserSession(userId)
      await ctx.reply('👋 ¡Hasta luego!\n\n/start para volver a conectarte.')
      return
    }

    return
  }

  // New Visit Flow
  if (
    step === 'visitor_name' ||
    step === 'visitor_phone' ||
    step === 'visit_date' ||
    step === 'visit_time' ||
    step === 'visit_purpose' ||
    step === 'visit_destination'
  ) {
    await handleNewVisitFlow(ctx)
    return
  }

  // Confirm Visit
  if (step === 'confirm_visit') {
    if (text === '✅ Confirmar' || text === '/confirmar') {
      await handleConfirmVisit(ctx)
      return
    }

    if (text === '❌ Cancelar' || text === '/cancelar') {
      await handleCancelVisit(ctx)
      return
    }

    return
  }
})

// Manejo de errores
bot.catch((err, ctx) => {
  console.error('Error en bot:', err)
  console.error('Context:', ctx)
  ctx.reply('❌ Hubo un error. Intenta de nuevo más tarde o usa /start para comenzar.').catch((e) => console.error('Error respondiendo:', e))
})

// Exportar bot para uso en funciones serverless
export default bot

// Iniciar bot en modo polling (para desarrollo local)
if (process.env.NODE_ENV !== 'production') {
  bot.launch()
  console.log(`✅ Bot ${config.bot.name} iniciado en modo desarrollo`)
  console.log(`Escuchando mensajes...`)

  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
