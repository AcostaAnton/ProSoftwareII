import { Context } from 'telegraf'
import { createVisit } from '../services/visits.service'
import { clearUserSession, getUserSession, setUserStep, showMainMenu } from './session.handler'

export async function handleConfirmVisit(ctx: Context) {
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('❌ Error: No se pudo procesar tu solicitud.')
    return
  }

  const session = getUserSession(userId)
  const { data } = session

  // Verificar que tengamos datos requeridos
  if (!data.visitor_name || !data.visit_date || !data.resident_id) {
    await ctx.reply('❌ Faltan datos requeridos. Por favor, comienza de nuevo.')
    setUserStep(userId, 'main_menu')
    await showMainMenu(ctx)
    return
  }

  // Crear la visita
  const result = await createVisit({
    resident_id: data.resident_id,
    visitor_name: data.visitor_name,
    visitor_phone: data.visitor_phone || null,
    visit_date: data.visit_date,
    visit_time: data.visit_time || null,
    visit_purpose: data.visit_purpose || null,
    visit_destination: data.visit_destination || null,
  })

  if (!result.success) {
    await ctx.reply(`❌ Error: ${result.error}`)
    setUserStep(userId, 'main_menu')
    await showMainMenu(ctx)
    return
  }

  // Mostrar confirmación con QR
  let confirmationMessage = '✅ *¡Visita Registrada Exitosamente!*\n\n'
  confirmationMessage += `📋 Información de la Visita:\n`
  confirmationMessage += `👤 Visitante: ${data.visitor_name}\n`
  confirmationMessage += `📅 Fecha: ${data.visit_date}\n`
  if (data.visit_time) confirmationMessage += `⏰ Hora: ${data.visit_time}\n`

  confirmationMessage += `\n🔐 Token QR: \`${result.qrToken}\`\n`
  confirmationMessage += `\n📝 *Estado: Pendiente de Aprobación*\n`
  confirmationMessage += `\nTu visita ha sido registrada. El código de seguridad confirmará cuando el visitante llegue.`

  await ctx.reply(confirmationMessage, { parse_mode: 'Markdown' })

  // Limpiar datos de la sesión
  setUserStep(userId, 'main_menu')
  await showMainMenu(ctx)
}

export async function handleCancelVisit(ctx: Context) {
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('❌ Error: No se pudo procesar tu solicitud.')
    return
  }

  await ctx.reply('❌ Visita cancelada.')

  setUserStep(userId, 'main_menu')
  await showMainMenu(ctx)
}
