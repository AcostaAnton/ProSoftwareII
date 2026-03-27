import { Context } from 'telegraf'
import { ReplyKeyboardRemove } from 'telegraf/types'

// Almacenar sesiones de usuario (en producción usar Redis o DB)
const userSessions = new Map<number, { step: string; data: Record<string, string> }>()

export function getUserSession(userId: number) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, { step: 'idle', data: {} })
  }
  return userSessions.get(userId)!
}

export function clearUserSession(userId: number) {
  userSessions.delete(userId)
}

export function setUserStep(userId: number, step: string) {
  const session = getUserSession(userId)
  session.step = step
}

export function setUserData(userId: number, key: string, value: string) {
  const session = getUserSession(userId)
  session.data[key] = value
}

export function getUserData(userId: number, key: string): string | undefined {
  const session = getUserSession(userId)
  return session.data[key]
}

export function getUserFullData(userId: number): Record<string, string> {
  const session = getUserSession(userId)
  return session.data
}

export async function showMainMenu(ctx: Context) {
  const keyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '➕ Nueva Visita' }, { text: '📋 Mis Visitas' }],
        [{ text: '❌ Salir' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  }

  await ctx.reply(
    '📱 *Menú Principal*\n\n¿Qué deseas hacer?',
    { parse_mode: 'Markdown', ...keyboard }
  )
}

export async function showLoginPrompt(ctx: Context) {
  const keyboard = {
    reply_markup: {
      remove_keyboard: true,
    } as ReplyKeyboardRemove,
  }

  await ctx.reply(
    '🔐 Por favor, ingresa tu correo electrónico (el mismo que usas en la Web PasaYa):',
    keyboard
  )
}

export async function showPasswordPrompt(ctx: Context) {
  const keyboard = {
    reply_markup: {
      remove_keyboard: true,
    } as ReplyKeyboardRemove,
  }

  await ctx.reply(
    '🔑 Ahora ingresa tu contraseña:',
    keyboard
  )
}

export async function showVisitForm(ctx: Context) {
  setUserStep(ctx.from!.id, 'visitor_name')

  const keyboard = {
    reply_markup: {
      remove_keyboard: true,
    } as ReplyKeyboardRemove,
  }

  await ctx.reply(
    '📝 *Nueva Visita*\n\nPor favor, completa la información de tu visitante.\n\n' +
    '¿Cuál es el nombre del visitante?',
    { parse_mode: 'Markdown', ...keyboard }
  )
}
