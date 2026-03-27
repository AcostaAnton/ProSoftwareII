import { Context } from 'telegraf'
import { getResidentVisits } from '../services/visits.service'
import { getUserSession, showMainMenu, showLoginPrompt } from './session.handler'

export async function handleShowVisits(ctx: Context) {
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('❌ Error: No se pudo procesar tu solicitud.')
    return
  }

  const session = getUserSession(userId)

  if (!session.data.authenticated) {
    await ctx.reply('🔓 Primero necesitas autenticarte.')
    await showLoginPrompt(ctx)
    return
  }

  const residentId = session.data.resident_id

  if (!residentId) {
    await ctx.reply('❌ No se puede obtener tus visitas. Intenta de nuevo más tarde.')
    return
  }

  const visits = await getResidentVisits(residentId, 10)

  if (visits.length === 0) {
    await ctx.reply('📋 No tienes visitas registradas aún.\n\n➕ ¿Deseas crear una nueva?')
    await showMainMenu(ctx)
    return
  }

  let message = '📋 *Tus Visitas Recientes*\n\n'

  visits.forEach((visit, index) => {
    const statusEmoji = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌',
      completed: '🏁',
      cancelled: '🚫',
    }[visit.status as string] || '❓'

    message += `${index + 1}. ${statusEmoji} ${visit.visitor_name}\n`
    message += `   📅 ${visit.visit_date}\n`
    message += `   Estado: ${visit.status}\n\n`
  })

  await ctx.reply(message, { parse_mode: 'Markdown' })
  await showMainMenu(ctx)
}
