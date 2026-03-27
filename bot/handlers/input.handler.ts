import { Context } from 'telegraf'
import { Message } from 'telegraf/types'
import { authenticateUser } from '../services/pinAuth.service'
import { getResidentInfo } from '../services/visits.service'
import { getUserSession, setUserData, setUserStep, showMainMenu, showVisitForm, showPasswordPrompt } from './session.handler'

export async function handleAuthFlow(ctx: Context) {
  const userId = ctx.from?.id
  const message = ctx.message

  // Verificar que sea un mensaje de texto
  if (!userId || !message || !('text' in message)) {
    return ctx.reply('❌ Mensaje no válido. Por favor envía un mensaje de texto.')
  }

  const text = message.text

  const session = getUserSession(userId)
  const step = session.step

  // PASO 1: Solicitar Email
  if (step === 'email_input') {
    // Validar que sea un email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message)) {
      await ctx.reply('❌ Por favor, ingresa un email válido (ej: usuario@ejemplo.com):')
      return
    }

    setUserData(userId, 'email', message)
    setUserStep(userId, 'password_input')

    await showPasswordPrompt(ctx)
    return
  }

  // PASO 2: Solicitar Contraseña y Autenticar
  if (step === 'password_input') {
    const email = getUserDataValue(userId, 'email')

    if (!email) {
      await ctx.reply('❌ Error: Email no encontrado. Intenta de nuevo con /start')
      return
    }

    // Mostrar "escribiendo..." mientras se autentica
    await ctx.sendChatAction('typing')

    // Autenticar con email y contraseña
    const authResult = await authenticateUser(email, message)

    if (!authResult.success) {
      await ctx.reply(`❌ ${authResult.error}\n\nIntenta de nuevo con /start`)
      setUserStep(userId, 'idle')
      return
    }

    // Guardar la información del usuario autenticado
    setUserData(userId, 'authenticated', 'true')
    setUserData(userId, 'user_id', authResult.userId || '')
    setUserData(userId, 'user_name', authResult.userName || '')
    setUserData(userId, 'user_role', authResult.userRole || '')
    setUserData(userId, 'user_email', authResult.userEmail || '')

    // Obtener información del residente
    const residentInfo = await getResidentInfo(authResult.userId || '')

    if (residentInfo) {
      setUserData(userId, 'resident_id', residentInfo.id)
      setUserData(userId, 'unit_number', residentInfo.unit_number || '')
    }

    // Mostrar mensaje de bienvenida
    await ctx.reply(
      `✅ ¡Autenticación exitosa!\n\n👋 Bienvenido, ${authResult.userName}!`,
      { parse_mode: 'Markdown' }
    )

    setUserStep(userId, 'main_menu')
    await showMainMenu(ctx)
  }
}

export async function handleNewVisitFlow(ctx: Context) {
  const userId = ctx.from?.id
  const message = ctx.message

  // Verificar que sea un mensaje de texto
  if (!userId || !message || !('text' in message)) {
    return ctx.reply('❌ Mensaje no válido. Por favor envía un mensaje de texto.')
  }

  const text = message.text
  const session = getUserSession(userId)

  if (!userId || !message) {
    await ctx.reply('❌ Error: No se pudo procesar tu entrada.')
    return
  }

  const step = session.step

  if (step === 'visitor_name') {
    setUserData(userId, 'visitor_name', message)
    setUserStep(userId, 'visitor_phone')

    await ctx.reply(
      '📱 ¿Cuál es el teléfono del visitante? (opcional, presiona /skip para omitir)',
      { parse_mode: 'Markdown' }
    )
  } else if (step === 'visitor_phone') {
    if (message !== '/skip') {
      setUserData(userId, 'visitor_phone', message)
    }

    setUserStep(userId, 'visit_date')

    const today = new Date().toISOString().split('T')[0]

    await ctx.reply(
      `📅 ¿Cuál es la fecha de la visita?\n\nFormato: YYYY-MM-DD (ej: ${today})\n` +
      `Presiona /today para usar hoy`,
      { parse_mode: 'Markdown' }
    )
  } else if (step === 'visit_date') {
    let visitDate = message

    if (message === '/today') {
      visitDate = new Date().toISOString().split('T')[0]
    }

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
      await ctx.reply('❌ Formato de fecha inválido. Usa YYYY-MM-DD')
      return
    }

    setUserData(userId, 'visit_date', visitDate)
    setUserStep(userId, 'visit_time')

    await ctx.reply(
      '⏰ ¿Cuál es la hora de la visita?\n\nFormato: HH:MM (ej: 14:30)\n' +
      'Presiona /skip para omitir',
      { parse_mode: 'Markdown' }
    )
  } else if (step === 'visit_time') {
    if (message !== '/skip') {
      // Validar formato de hora
      if (!/^\d{2}:\d{2}$/.test(message)) {
        await ctx.reply('❌ Formato de hora inválido. Usa HH:MM')
        return
      }

      setUserData(userId, 'visit_time', message)
    }

    setUserStep(userId, 'visit_purpose')

    await ctx.reply(
      '🎯 ¿Cuál es el propósito de la visita?\n\n' +
      '(ej: Reparación, Entrega, Social, etc.)\n' +
      'Presiona /skip para omitir',
      { parse_mode: 'Markdown' }
    )
  } else if (step === 'visit_purpose') {
    if (message !== '/skip') {
      setUserData(userId, 'visit_purpose', message)
    }

    setUserStep(userId, 'visit_destination')

    await ctx.reply(
      '📍 ¿Cuál es destino o área de la visita?\n\n' +
      '(ej: Departamento, Piscina, Área común, etc.)\n' +
      'Presiona /skip para omitir',
      { parse_mode: 'Markdown' }
    )
  } else if (step === 'visit_destination') {
    if (message !== '/skip') {
      setUserData(userId, 'visit_destination', message)
    }

    setUserStep(userId, 'confirm_visit')

    // Mostrar resumen
    const visitorName = getUserDataValue(userId, 'visitor_name')
    const visitorPhone = getUserDataValue(userId, 'visitor_phone')
    const visitDate = getUserDataValue(userId, 'visit_date')
    const visitTime = getUserDataValue(userId, 'visit_time')
    const visitPurpose = getUserDataValue(userId, 'visit_purpose')
    const visitDestination = getUserDataValue(userId, 'visit_destination')

    let summary = '✅ *Resumen de la Visita*\n\n'
    summary += `👤 Visitante: ${visitorName}\n`
    if (visitorPhone) summary += `📱 Teléfono: ${visitorPhone}\n`
    summary += `📅 Fecha: ${visitDate}\n`
    if (visitTime) summary += `⏰ Hora: ${visitTime}\n`
    if (visitPurpose) summary += `🎯 Propósito: ${visitPurpose}\n`
    if (visitDestination) summary += `📍 Destino: ${visitDestination}\n`

    summary += '\n¿Es correcta la información? Presiona\n'
    summary += '/confirmar para crear la visita\n'
    summary += '/cancelar para empezar de nuevo'

    const keyboard = {
      reply_markup: {
        keyboard: [
          [{ text: '✅ Confirmar' }, { text: '❌ Cancelar' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }

    await ctx.reply(summary, { parse_mode: 'Markdown', ...keyboard })
  }
}

function getUserDataValue(userId: number, key: string): string {
  const session = getUserSession(userId)
  return session.data[key] || '(no mostrado)'
}
